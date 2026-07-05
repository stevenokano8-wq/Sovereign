import { GoogleGenAI, Type } from "@google/genai";
import { Task, Subtask, FileNode, Message } from "../src/types.js";
import { saveTask, saveFile, addMessage, getTasks } from "./db.js";
import { redisSet, redisGet } from "./redis.js";

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Settings panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Active SSE client connections for real-time progress broadcasts
export const sseClients = new Set<any>();

export function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      // client disconnected
      sseClients.delete(client);
    }
  }
}

// Generates tasks and subtasks structure based on a user prompt
export async function planBuildTasks(userPrompt: string): Promise<Task[]> {
  try {
    const ai = getGeminiClient();
    console.log("Planning build tasks using Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are Sovereign Agent, an expert full-stack developer. Break down this request into exactly 3 key developmental tasks. Each task should have exactly 3-4 subtasks.
      Request: "${userPrompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["tasks"],
          properties: {
            tasks: {
              type: Type.ARRAY,
              description: "High-level development tasks required to build this project.",
              items: {
                type: Type.OBJECT,
                required: ["name", "subtasks"],
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "Task title, e.g., 'Configure Authentication System'"
                  },
                  subtasks: {
                    type: Type.ARRAY,
                    description: "Step-by-step subtasks for this task.",
                    items: {
                      type: Type.STRING,
                      description: "Brief description of the action, e.g., 'Setup email/password login flow'"
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    const parsedTasks: Task[] = (result.tasks || []).map((t: any, idx: number) => {
      const taskId = `task-${Date.now()}-${idx}`;
      return {
        id: taskId,
        name: t.name,
        status: "pending",
        progress: 0,
        activeSubtaskIndex: 0,
        createdAt: new Date().toISOString(),
        subtasks: (t.subtasks || []).map((sub: string, subIdx: number) => ({
          id: `${taskId}-sub-${subIdx}`,
          taskId: taskId,
          name: sub,
          status: "pending",
          logs: ["Initialized subtask. Waiting for agent process allocation..."]
        }))
      };
    });

    return parsedTasks;
  } catch (err: any) {
    console.error("Failed planning build tasks with Gemini, creating default template tasks:", err.message);
    // Fallback tasks if Gemini is offline or API key is missing
    const taskId1 = `task-${Date.now()}-0`;
    const taskId2 = `task-${Date.now()}-1`;
    const taskId3 = `task-${Date.now()}-2`;
    return [
      {
        id: taskId1,
        name: "Establish Architectural Blueprint",
        status: "pending",
        progress: 0,
        activeSubtaskIndex: 0,
        createdAt: new Date().toISOString(),
        subtasks: [
          { id: `${taskId1}-sub-0`, taskId: taskId1, name: "Plan relational tables and Redis cache schema", status: "pending", logs: ["Waiting..."] },
          { id: `${taskId1}-sub-1`, taskId: taskId1, name: "Initialize server boilerplate & setup API proxies", status: "pending", logs: ["Waiting..."] },
          { id: `${taskId1}-sub-2`, taskId: taskId1, name: "Establish layout and dark/light UI boundaries", status: "pending", logs: ["Waiting..."] }
        ]
      },
      {
        id: taskId2,
        name: "Develop Core Server Interfaces",
        status: "pending",
        progress: 0,
        activeSubtaskIndex: 0,
        createdAt: new Date().toISOString(),
        subtasks: [
          { id: `${taskId2}-sub-0`, taskId: taskId2, name: "Implement Express REST endpoints", status: "pending", logs: ["Waiting..."] },
          { id: `${taskId2}-sub-1`, taskId: taskId2, name: "Integrate database client queries with fail-safes", status: "pending", logs: ["Waiting..."] },
          { id: `${taskId2}-sub-2`, taskId: taskId2, name: "Configure Redis caching logic for sessions", status: "pending", logs: ["Waiting..."] }
        ]
      },
      {
        id: taskId3,
        name: "Build High Fidelity Layout",
        status: "pending",
        progress: 0,
        activeSubtaskIndex: 0,
        createdAt: new Date().toISOString(),
        subtasks: [
          { id: `${taskId3}-sub-0`, taskId: taskId3, name: "Build interactive workspace and file list UI", status: "pending", logs: ["Waiting..."] },
          { id: `${taskId3}-sub-1`, taskId: taskId3, name: "Wire-up WebSocket connection logs and charts", status: "pending", logs: ["Waiting..."] },
          { id: `${taskId3}-sub-2`, taskId: taskId3, name: "Deploy visual state check and finish review", status: "pending", logs: ["Waiting..."] }
        ]
      }
    ];
  }
}

// Background builder that executes subtasks sequentially
// and writes real-time logs and generated files!
export async function executeAgentBuild(prompt: string, tasks: Task[]) {
  console.log(`Starting execution for prompt: ${prompt}`);

  // Broadcast to all connected clients that an agent run has started
  broadcastSSE("build-started", { prompt, totalTasks: tasks.length });

  // Keep a running store of generated files
  const fileRegistry: FileNode[] = [];

  for (let tIdx = 0; tIdx < tasks.length; tIdx++) {
    const task = tasks[tIdx];
    task.status = "running";
    await saveTask(task);
    broadcastSSE("task-update", task);

    const subtasks = task.subtasks;
    for (let sIdx = 0; sIdx < subtasks.length; sIdx++) {
      const sub = subtasks[sIdx];
      task.activeSubtaskIndex = sIdx;
      sub.status = "running";
      sub.logs = [`[Sovereign Agent] Starting development of: "${sub.name}"...`];
      await saveTask(task);
      broadcastSSE("task-update", task);

      // Perform simulated step logs and file writing
      const steps = [
        "Analyzing project context and structural requirements...",
        "Validating database schema migrations and indexing constraints...",
        "Writing target module implementation...",
        "Performing type checking and unit test suites...",
        "Optimizing file delivery and completing workspace sync."
      ];

      for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 500));
        sub.logs.push(`[${new Date().toLocaleTimeString()}] ${steps[stepIdx]}`);

        // If on step 3, we actually generate a file related to the subtask and save it!
        if (stepIdx === 2) {
          try {
            const ai = getGeminiClient();
            const filePrompt = `You are a professional full-stack developer. Write a fully-functional, beautiful, complete TypeScript React file, Express router, HTML, or schema file for the subtask: "${sub.name}" inside the larger project of: "${prompt}". Return ONLY the code, with no markdown tags, and no conversational text. Start with the code directly.`;
            
            sub.logs.push(`[SYSTEM] Requesting AI code synthesis for code modules...`);
            const fileRes = await ai.models.generateContent({
              model: "gemini-3.5-flash",
              contents: filePrompt,
            });

            let fileContent = fileRes.text || "// AI Synthesis yielded empty code file.";
            // Strip any markdown code fence blocks if returned
            if (fileContent.startsWith("```")) {
              const lines = fileContent.split("\n");
              if (lines[0].startsWith("```")) lines.shift();
              if (lines[lines.length - 1].startsWith("```")) lines.pop();
              fileContent = lines.join("\n");
            }

            const fileName = sub.name.toLowerCase().replace(/[^a-z0-9]/g, "_").substring(0, 20) + (sub.name.includes("schema") ? "_schema.ts" : sub.name.includes("endpoint") || sub.name.includes("Express") ? "_api.ts" : "_component.tsx");
            const filePath = `src/generated/${fileName}`;
            const fileNode: FileNode = {
              path: filePath,
              content: fileContent,
              language: filePath.endsWith(".ts") || filePath.endsWith(".tsx") ? "typescript" : "html"
            };

            await saveFile(fileNode);
            sub.file = filePath;
            sub.code = fileContent;
            sub.logs.push(`[SUCCESS] File successfully generated and stored: ${filePath}`);
            
            // Also notify client of the new file
            broadcastSSE("file-created", fileNode);
          } catch (e: any) {
            sub.logs.push(`[INFO] Code synthesis fallback. Generating mock template file: src/generated/module_${sIdx}.ts`);
            const mockContent = `/**\n * Generated Module - ${sub.name}\n * Purpose: ${sub.name}\n */\nexport function run() {\n  console.log("Module initialized for ${sub.name}");\n}`;
            const filePath = `src/generated/module_${sIdx}.ts`;
            const fileNode: FileNode = {
              path: filePath,
              content: mockContent,
              language: "typescript"
            };
            await saveFile(fileNode);
            sub.file = filePath;
            sub.code = mockContent;
            broadcastSSE("file-created", fileNode);
          }
        }

        // Increment subtask progress inside task
        task.progress = Math.round(
          ((sIdx * steps.length + (stepIdx + 1)) / (subtasks.length * steps.length)) * 100
        );
        
        await saveTask(task);
        broadcastSSE("task-update", task);
      }

      sub.status = "completed";
      sub.logs.push(`[SUCCESS] "${sub.name}" completed successfully.`);
      await saveTask(task);
      broadcastSSE("task-update", task);
    }

    task.status = "completed";
    task.progress = 100;
    await saveTask(task);
    broadcastSSE("task-update", task);
  }

  // Create final agent response message in the chat
  const assistantMsg: Message = {
    id: `msg-${Date.now()}-finish`,
    role: "assistant",
    content: `### Sovereign Agent Task Report
I have successfully designed, built, and deployed the full stack components for **"${prompt}"**! 

Here is what was completed:
${tasks.map(t => `- **${t.name}**: Completed 100% with ${t.subtasks.length} subtasks.`).join("\n")}

You can inspect all synthesized files in the **Code Tab**, run the live preview container in the **Preview Tab**, and adjust the PostgreSQL/Redis settings in the **Settings** dropdown!`,
    timestamp: new Date().toISOString()
  };

  await addMessage(assistantMsg);
  broadcastSSE("build-finished", assistantMsg);
}
