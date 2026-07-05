import { Client } from "pg";
import fs from "fs";
import path from "path";
import { Message, Task, Subtask, FileNode, DatabaseStatus } from "../src/types.js";

const DB_FILE_PATH = path.join(process.cwd(), "workspace_db.json");

let pgClient: Client | null = null;
let useLocalJson = true;

// Define local in-memory/file cache structures
interface LocalDbSchema {
  messages: Message[];
  tasks: Task[];
  files: FileNode[];
}

let localDb: LocalDbSchema = {
  messages: [],
  tasks: [],
  files: [],
};

// Seed some initial welcome data if empty
const initialMessages: Message[] = [
  {
    id: "welcome-msg",
    role: "assistant",
    content: "Hi! I am your **Sovereign Agent** coding assistant. I am fully equipped to handle full-stack builds, manage complex subtask trees, and stream real-time visual progress cards. Ask me to build anything, and let's bring your vision to life!",
    timestamp: new Date().toISOString(),
  }
];

// Helper to load/save JSON file
function loadLocalDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, "utf8");
      localDb = JSON.parse(data);
    } else {
      localDb = { messages: initialMessages, tasks: [], files: [] };
      saveLocalDb();
    }
  } catch (err) {
    console.error("Failed to load local JSON database:", err);
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(localDb, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write local JSON database:", err);
  }
}

export async function initDb(): Promise<DatabaseStatus> {
  const dbUrl = process.env.DATABASE_URL;

  loadLocalDb();

  if (!dbUrl) {
    console.log("No DATABASE_URL configured. Falling back to robust local SQLite/JSON persistence.");
    useLocalJson = true;
    return { postgres: "local_fallback", redis: "local_fallback", postgresUrl: undefined };
  }

  try {
    pgClient = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false } // standard for external cloud SQL providers like Neon/Aiven
    });

    await pgClient.connect();
    useLocalJson = false;
    console.log("Successfully connected to PostgreSQL database!");

    // Create tables
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        timestamp VARCHAR(100) NOT NULL,
        task_id VARCHAR(255)
      );
    `);

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        progress INT NOT NULL,
        active_subtask_index INT NOT NULL,
        created_at VARCHAR(100) NOT NULL,
        complexity VARCHAR(20),
        requires_approval BOOLEAN,
        approval_reason TEXT,
        build_id VARCHAR(255)
      );
    `);

    // Backfill columns for tables created before these fields existed.
    await pgClient.query(`
      ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS complexity VARCHAR(20),
        ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN,
        ADD COLUMN IF NOT EXISTS approval_reason TEXT,
        ADD COLUMN IF NOT EXISTS build_id VARCHAR(255);
    `);

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id VARCHAR(255) PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        logs TEXT NOT NULL,
        code TEXT,
        file VARCHAR(255)
      );
    `);

    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS files (
        path VARCHAR(255) PRIMARY KEY,
        content TEXT NOT NULL,
        language VARCHAR(50) NOT NULL
      );
    `);

    // Check if there are any existing messages. If not, seed the welcome message.
    const msgCheck = await pgClient.query("SELECT COUNT(*) FROM messages");
    if (parseInt(msgCheck.rows[0].count) === 0) {
      await pgClient.query(
        "INSERT INTO messages (id, role, content, timestamp, task_id) VALUES ($1, $2, $3, $4, $5)",
        [initialMessages[0].id, initialMessages[0].role, initialMessages[0].content, initialMessages[0].timestamp, null]
      );
    }

    return { postgres: "connected", redis: "local_fallback", postgresUrl: dbUrl };
  } catch (err: any) {
    console.error("PostgreSQL connection error, falling back to local JSON persistence:", err.message);
    useLocalJson = true;
    return { postgres: "error", redis: "local_fallback", postgresUrl: dbUrl };
  }
}

// Relational queries
export async function getMessages(): Promise<Message[]> {
  if (useLocalJson) {
    loadLocalDb();
    return localDb.messages;
  }

  try {
    const res = await pgClient!.query("SELECT * FROM messages ORDER BY timestamp ASC");
    return res.rows.map(row => ({
      id: row.id,
      role: row.role as any,
      content: row.content,
      timestamp: row.timestamp,
      taskId: row.task_id || undefined
    }));
  } catch (err) {
    console.error("Failed to query messages from Postgres:", err);
    return localDb.messages;
  }
}

export async function addMessage(msg: Message): Promise<void> {
  if (useLocalJson) {
    loadLocalDb();
    localDb.messages.push(msg);
    saveLocalDb();
    return;
  }

  try {
    await pgClient!.query(
      "INSERT INTO messages (id, role, content, timestamp, task_id) VALUES ($1, $2, $3, $4, $5)",
      [msg.id, msg.role, msg.content, msg.timestamp, msg.taskId || null]
    );
  } catch (err) {
    console.error("Failed to insert message to Postgres:", err);
    // Fallback to local
    localDb.messages.push(msg);
    saveLocalDb();
  }
}

export async function clearMessages(): Promise<void> {
  if (useLocalJson) {
    loadLocalDb();
    localDb.messages = [...initialMessages];
    saveLocalDb();
    return;
  }

  try {
    await pgClient!.query("DELETE FROM messages");
    await pgClient!.query(
      "INSERT INTO messages (id, role, content, timestamp, task_id) VALUES ($1, $2, $3, $4, $5)",
      [initialMessages[0].id, initialMessages[0].role, initialMessages[0].content, initialMessages[0].timestamp, null]
    );
  } catch (err) {
    console.error("Failed to clear messages from Postgres:", err);
  }
}

export async function getTasks(): Promise<Task[]> {
  if (useLocalJson) {
    loadLocalDb();
    return localDb.tasks;
  }

  try {
    const tasksRes = await pgClient!.query("SELECT * FROM tasks ORDER BY created_at DESC");
    const subtasksRes = await pgClient!.query("SELECT * FROM subtasks");

    const subtasksByTask: Record<string, Subtask[]> = {};
    for (const row of subtasksRes.rows) {
      if (!subtasksByTask[row.task_id]) {
        subtasksByTask[row.task_id] = [];
      }
      subtasksByTask[row.task_id].push({
        id: row.id,
        taskId: row.task_id,
        name: row.name,
        status: row.status as any,
        logs: JSON.parse(row.logs),
        code: row.code || undefined,
        file: row.file || undefined,
      });
    }

    return tasksRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status as any,
      progress: row.progress,
      activeSubtaskIndex: row.active_subtask_index,
      createdAt: row.created_at,
      subtasks: subtasksByTask[row.id] || [],
      complexity: row.complexity || undefined,
      requiresApproval: row.requires_approval ?? undefined,
      approvalReason: row.approval_reason || undefined,
      buildId: row.build_id || undefined,
    }));
  } catch (err) {
    console.error("Failed to fetch tasks from Postgres:", err);
    return localDb.tasks;
  }
}

export async function saveTask(task: Task): Promise<void> {
  if (useLocalJson) {
    loadLocalDb();
    const idx = localDb.tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      localDb.tasks[idx] = task;
    } else {
      localDb.tasks.push(task);
    }
    saveLocalDb();
    return;
  }

  try {
    // Check if task exists
    const check = await pgClient!.query("SELECT id FROM tasks WHERE id = $1", [task.id]);
    if (check.rows.length > 0) {
      await pgClient!.query(
        "UPDATE tasks SET name = $1, status = $2, progress = $3, active_subtask_index = $4, complexity = $5, requires_approval = $6, approval_reason = $7, build_id = $8 WHERE id = $9",
        [task.name, task.status, task.progress, task.activeSubtaskIndex, task.complexity || null, task.requiresApproval ?? null, task.approvalReason || null, task.buildId || null, task.id]
      );
    } else {
      await pgClient!.query(
        "INSERT INTO tasks (id, name, status, progress, active_subtask_index, created_at, complexity, requires_approval, approval_reason, build_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [task.id, task.name, task.status, task.progress, task.activeSubtaskIndex, task.createdAt, task.complexity || null, task.requiresApproval ?? null, task.approvalReason || null, task.buildId || null]
      );
    }

    // Upsert subtasks
    for (const sub of task.subtasks) {
      const subCheck = await pgClient!.query("SELECT id FROM subtasks WHERE id = $1", [sub.id]);
      if (subCheck.rows.length > 0) {
        await pgClient!.query(
          "UPDATE subtasks SET name = $1, status = $2, logs = $3, code = $4, file = $5 WHERE id = $6",
          [sub.name, sub.status, JSON.stringify(sub.logs), sub.code || null, sub.file || null, sub.id]
        );
      } else {
        await pgClient!.query(
          "INSERT INTO subtasks (id, task_id, name, status, logs, code, file) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [sub.id, sub.taskId, sub.name, sub.status, JSON.stringify(sub.logs), sub.code || null, sub.file || null]
        );
      }
    }
  } catch (err) {
    console.error("Failed to upsert task in Postgres:", err);
  }
}

export async function deleteTaskById(taskId: string): Promise<void> {
  if (useLocalJson) {
    loadLocalDb();
    localDb.tasks = localDb.tasks.filter(t => t.id !== taskId);
    saveLocalDb();
    return;
  }

  try {
    await pgClient!.query("DELETE FROM subtasks WHERE task_id = $1", [taskId]);
    await pgClient!.query("DELETE FROM tasks WHERE id = $1", [taskId]);
  } catch (err) {
    console.error("Failed to delete task from Postgres:", err);
  }
}

export async function deleteTasks(): Promise<void> {
  if (useLocalJson) {
    loadLocalDb();
    localDb.tasks = [];
    saveLocalDb();
    return;
  }

  try {
    await pgClient!.query("DELETE FROM subtasks");
    await pgClient!.query("DELETE FROM tasks");
  } catch (err) {
    console.error("Failed to delete tasks from Postgres:", err);
  }
}

export async function getFiles(): Promise<FileNode[]> {
  if (useLocalJson) {
    loadLocalDb();
    return localDb.files;
  }

  try {
    const res = await pgClient!.query("SELECT * FROM files");
    return res.rows.map(row => ({
      path: row.path,
      content: row.content,
      language: row.language
    }));
  } catch (err) {
    console.error("Failed to fetch files from Postgres:", err);
    return localDb.files;
  }
}

export async function saveFile(file: FileNode): Promise<void> {
  if (useLocalJson) {
    loadLocalDb();
    const idx = localDb.files.findIndex(f => f.path === file.path);
    if (idx >= 0) {
      localDb.files[idx] = file;
    } else {
      localDb.files.push(file);
    }
    saveLocalDb();
    return;
  }

  try {
    const check = await pgClient!.query("SELECT path FROM files WHERE path = $1", [file.path]);
    if (check.rows.length > 0) {
      await pgClient!.query(
        "UPDATE files SET content = $1, language = $2 WHERE path = $3",
        [file.content, file.language, file.path]
      );
    } else {
      await pgClient!.query(
        "INSERT INTO files (path, content, language) VALUES ($1, $2, $3)",
        [file.path, file.content, file.language]
      );
    }
  } catch (err) {
    console.error("Failed to save file in Postgres:", err);
  }
}

export async function clearFiles(): Promise<void> {
  if (useLocalJson) {
    loadLocalDb();
    localDb.files = [];
    saveLocalDb();
    return;
  }

  try {
    await pgClient!.query("DELETE FROM files");
  } catch (err) {
    console.error("Failed to clear files from Postgres:", err);
  }
}
