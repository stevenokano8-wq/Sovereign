export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  taskId?: string; // If this message spawned a task
}

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval';
  progress: number; // 0 to 100
  activeSubtaskIndex: number;
  createdAt: string;
  subtasks: Subtask[];
  complexity?: 'simple' | 'complex';
  requiresApproval?: boolean;
  approvalReason?: string;
  buildId?: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logs: string[];
  code?: string;
  file?: string;
}

export interface FileNode {
  path: string;
  content: string;
  language: string;
}

export interface DatabaseStatus {
  postgres: 'connected' | 'local_fallback' | 'error';
  redis: 'connected' | 'local_fallback' | 'error';
  postgresUrl?: string;
  redisUrl?: string;
}

export interface AgentSession {
  id: string;
  name: string;
  createdAt: string;
}
