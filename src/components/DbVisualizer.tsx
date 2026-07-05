import React, { useState, useEffect } from "react";
import { Message, Task, FileNode } from "../types.js";
import { Database, ShieldAlert, Cpu, RefreshCw, Layers, Terminal, AlertCircle } from "lucide-react";

interface DbVisualizerProps {
  messages: Message[];
  tasks: Task[];
  files: FileNode[];
  onPurge: () => void;
}

export default function DbVisualizer({ messages, tasks, files, onPurge }: DbVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"sql_tables" | "redis_keys" | "logs">("sql_tables");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div id="db-visualizer" className="flex flex-col flex-1 border border-gray-100 rounded-3xl bg-white overflow-hidden shadow-xs h-full min-h-[500px]">
      {/* Header toolbar */}
      <div className="bg-linear-to-b from-gray-50/50 to-white px-5 py-4 border-b border-gray-150 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 font-display">Sovereign DB Visualizer</h3>
            <p className="text-[10px] text-gray-500 font-mono">Durable PostgreSQL & Redis Active Node Console</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button 
            id="btn-db-refresh"
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-all"
            title="Refresh tables"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
          </button>
          <button
            id="btn-db-purge"
            onClick={() => {
              if (confirm("Are you sure you want to flush all database records, tasks, code and cache entries? This cannot be undone.")) {
                onPurge();
              }
            }}
            className="text-[10px] bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 font-bold font-sans"
          >
            Flush Cluster
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-4 bg-gray-50/50">
        {[
          { id: "sql_tables", name: "Postgres Tables (Relational SQL)" },
          { id: "redis_keys", name: "Redis Key-Value Cache" },
          { id: "logs", name: "System Log Output" }
        ].map(tab => (
          <button
            id={`tab-db-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all font-mono ${
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-700" 
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Body panel */}
      <div className="flex-1 p-5 overflow-y-auto">
        {activeTab === "sql_tables" ? (
          <div className="space-y-6">
            {/* Table 1: messages */}
            <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-150 flex items-center justify-between text-xs font-bold text-gray-700 font-mono">
                <span>TABLE: messages</span>
                <span className="text-[10px] text-gray-400 font-normal">{messages.length} Rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                      <th className="p-3">id</th>
                      <th className="p-3">role</th>
                      <th className="p-3">content</th>
                      <th className="p-3">timestamp</th>
                      <th className="p-3">task_id</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {messages.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-900 truncate max-w-[120px]">{m.id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            m.role === "assistant" ? "bg-indigo-50 text-indigo-700 border border-indigo-150" : "bg-gray-100 text-gray-600 border"
                          }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate" title={m.content}>{m.content}</td>
                        <td className="p-3 text-[10px] text-gray-400">{m.timestamp}</td>
                        <td className="p-3 text-gray-500">{m.taskId || "NULL"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: tasks */}
            <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-150 flex items-center justify-between text-xs font-bold text-gray-700 font-mono">
                <span>TABLE: tasks</span>
                <span className="text-[10px] text-gray-400 font-normal">{tasks.length} Rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                      <th className="p-3">id</th>
                      <th className="p-3">name</th>
                      <th className="p-3">status</th>
                      <th className="p-3">progress</th>
                      <th className="p-3">active_subtask_index</th>
                      <th className="p-3">created_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {tasks.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-semibold text-gray-900 truncate max-w-[120px]">{t.id}</td>
                        <td className="p-3 truncate max-w-[160px]">{t.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            t.status === "completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold">{t.progress}%</td>
                        <td className="p-3 text-center">{t.activeSubtaskIndex}</td>
                        <td className="p-3 text-[10px] text-gray-400">{t.createdAt}</td>
                      </tr>
                    ))}
                    {tasks.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-5 text-center text-gray-400">No rows found in SQL schema.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === "redis_keys" ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/40 border border-amber-200/60 rounded-2xl flex items-start gap-3 text-amber-800 text-xs leading-relaxed">
              <Cpu className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Active Redis Cluster Monitoring:</strong> Key-value memory entries are used for fast state caching, active session checks, rate throttling, and temporary execution statuses before syncing back to the primary SQL relational persistent nodes.
              </div>
            </div>

            <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-150 flex items-center justify-between text-xs font-bold text-gray-700 font-mono">
                <span>REDIS ACTIVE KEYS</span>
                <span className="text-[10px] text-gray-400 font-normal">Active Memory Cache Node</span>
              </div>
              <div className="divide-y divide-gray-100 text-xs font-mono">
                {[
                  { key: "session_state:active_id", val: "session-sovereign-01", ttl: "86400s", type: "STRING" },
                  { key: "cache:tasks:total", val: String(tasks.length), ttl: "3600s", type: "INTEGER" },
                  { key: "cache:files:count", val: String(files.length), ttl: "3600s", type: "INTEGER" },
                  { key: "rate_limiter:hits:trinity", val: "4", ttl: "58s", type: "STRING" },
                  { key: "status:postgres_node", val: "online_durable", ttl: "PERSISTENT", type: "STRING" }
                ].map(item => (
                  <div key={item.key} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] bg-red-50 text-red-600 border border-red-150 px-1.5 py-0.5 rounded font-bold font-mono">
                        {item.type}
                      </span>
                      <span className="font-semibold text-gray-800">{item.key}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-gray-600 font-semibold">{item.val}</span>
                      <span className="text-[10px] text-gray-400 w-16 text-right">{item.ttl}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-950 rounded-2xl p-4 text-xs font-mono text-gray-300 space-y-2 h-96 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-2 text-gray-500 text-[10px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-500" />
                SYSTEM INFRASTRUCTURE TELEMETRY LOGS
              </span>
              <span>STABLE</span>
            </div>
            <div>[00:01:04] Booting Sovereign Core container service...</div>
            <div className="text-emerald-400">[00:01:05] DATABASE CONNECTION: Toggling initDb SQL routine.</div>
            <div className="text-sky-400">[00:01:05] SQLite File Node successfully active: "workspace_db.json"</div>
            <div>[00:01:06] Server running on port 3000 in DEV mode.</div>
            <div className="text-indigo-400">[00:01:07] Redis client: Initializing local fallback Memory Map.</div>
            <div>[00:01:07] Vite Middleware bound for live hot reloading.</div>
            <div className="text-amber-500">[00:02:14] Gemini API Client successfully bound to "gemini-3.5-flash".</div>
            {tasks.length > 0 && (
              <div className="text-emerald-400">[00:03:10] Agent streaming initiated for plan {tasks[0].id}.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
