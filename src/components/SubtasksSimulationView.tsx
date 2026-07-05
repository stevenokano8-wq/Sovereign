import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Terminal, 
  FolderPlus, 
  Database, 
  Key, 
  Zap, 
  Play, 
  CheckCircle2, 
  Folder, 
  FileText, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Server, 
  Smartphone, 
  Monitor, 
  Search,
  Check,
  Send,
  Loader2,
  Lock,
  ListFilter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types for the simulation
interface LogMessage {
  timestamp: string;
  type: "system" | "event" | "llama" | "success" | "warning";
  text: string;
}

interface SimulatedSubtask {
  id: string;
  name: string;
  status: "pending" | "running" | "completed";
  progress: number;
  logs: string[];
}

interface SimulatedTask {
  id: string;
  name: string;
  status: "pending" | "running" | "completed";
  progress: number;
  subtasks: SimulatedSubtask[];
}

interface TemplateOption {
  id: string;
  title: string;
  command: string;
  icon: React.ComponentType<any>;
  color: string;
  badge: string;
  tasks: {
    name: string;
    subtasks: string[];
  }[];
  workspaceInjections: {
    path: string;
    type: "folder" | "file";
    content?: string;
  }[];
  mockAppContent: React.ReactNode;
}

export default function SubtasksSimulationView() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("folder-create");
  const [customCommand, setCustomCommand] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"idle" | "phase1" | "phase2" | "phase3" | "finished">("idle");
  const [activeAccordionId, setActiveAccordionId] = useState<string | null>(null);
  
  // Real-time states
  const [eventLogs, setEventLogs] = useState<LogMessage[]>([]);
  const [simulatedTasks, setSimulatedTasks] = useState<SimulatedTask[]>([]);
  const [visibleFiles, setVisibleFiles] = useState<{ path: string; type: "folder" | "file" }[]>([
    { path: "src/App.tsx", type: "file" },
    { path: "src/main.tsx", type: "file" },
    { path: "package.json", type: "file" },
  ]);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewReloading, setPreviewReloading] = useState(false);
  const [previewState, setPreviewState] = useState<"idle" | "reloading" | "live">("idle");

  const eventLogsEndRef = useRef<HTMLDivElement>(null);

  // Hardcoded template examples
  const templates: TemplateOption[] = [
    {
      id: "folder-create",
      title: "Folder Synthesizer",
      command: "create a folder named 'dashboard' and add metrics view",
      icon: FolderPlus,
      color: "bg-blue-500",
      badge: "Filesystem Job",
      tasks: [
        {
          name: "Verify Target Directory Hierarchy",
          subtasks: [
            "Check for naming conflicts with existing workspace clusters",
            "Synthesize safe paths for mkdir instructions inside sandbox root",
            "Establish metadata indexes for newly requested directory node"
          ]
        },
        {
          name: "Execute Cloudflare Fiber Background Job",
          subtasks: [
            "Trigger serverless fiber job: mkdir -p /src/generated/dashboard",
            "Create dashboard_metrics.tsx component placeholder",
            "Sync state tracking index SQLite database index"
          ]
        },
        {
          name: "Virtual DOM & Workspace Assembly",
          subtasks: [
            "Register new folder node inside File Explorer state structure",
            "Compile visual component triggers and hot-reload framing views"
          ]
        }
      ],
      workspaceInjections: [
        { path: "src/generated/dashboard", type: "folder" },
        { path: "src/generated/dashboard/dashboard_metrics.tsx", type: "file", content: "// Compiled metrics view components" }
      ],
      mockAppContent: (
        <div className="p-6 bg-slate-900 text-white h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs uppercase text-slate-400">Sandbox App Layer</span>
              </div>
              <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded">LIVE PREVIEW</span>
            </div>
            
            <h3 className="text-xl font-bold font-display text-white">Dashboard Controller</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Synthesized folder directory successfully active</p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { label: "Active Nodes", val: "18", color: "text-blue-400" },
                { label: "CPU Usage", val: "4.8%", color: "text-amber-400" },
                { label: "SSE Handshakes", val: "142/s", color: "text-emerald-400" }
              ].map((m, i) => (
                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">{m.label}</p>
                  <p className={`text-lg font-bold font-mono mt-1 ${m.color}`}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/50 p-3 rounded-lg flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Container Ingress: /src/generated/dashboard</span>
            <span className="text-emerald-500 font-bold">200 OK</span>
          </div>
        </div>
      )
    },
    {
      id: "firebase-auth",
      title: "Firebase OAuth Flow",
      command: "setup secure email/password and google authentication routes",
      icon: Key,
      color: "bg-amber-500",
      badge: "Firebase Core",
      tasks: [
        {
          name: "Initialize Firebase Client Configuration",
          subtasks: [
            "Detect environment credentials in .env storage",
            "Provision mock configuration client parameters safely",
            "Generate security boundaries for authentication endpoints"
          ]
        },
        {
          name: "Deploy Rules and Session Middleware",
          subtasks: [
            "Inject authStateChanged reactive observers inside App engine",
            "Configure sessionStorage tokens matching user identities",
            "Build custom redirection guards for authenticated paths"
          ]
        },
        {
          name: "Synthesize Registration GUI Blocks",
          subtasks: [
            "Generate beautiful secure login UI elements",
            "Bind form fields to backend auth handlers"
          ]
        }
      ],
      workspaceInjections: [
        { path: "src/generated/auth", type: "folder" },
        { path: "src/generated/auth/firebase_config.ts", type: "file", content: "// Firebase client setup code" },
        { path: "src/generated/auth/login_form.tsx", type: "file", content: "// Beautiful synthesized auth views" }
      ],
      mockAppContent: (
        <div className="p-6 bg-stone-50 text-stone-900 h-full flex flex-col justify-center max-w-sm mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-amber-500/10 rounded-full text-amber-600 mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-lg font-display text-stone-850">Trinity Secure Login</h4>
            <p className="text-xs text-stone-500 mt-1">Firebase Authentication active sandbox</p>
          </div>

          <div className="space-y-3 text-left">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Email Address</label>
              <input type="text" readOnly value="ceo@trinity-universe.com" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-stone-400 font-mono text-stone-700" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Password</label>
              <input type="password" readOnly value="••••••••••••••" className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-stone-400 font-mono text-stone-700" />
            </div>
          </div>

          <button onClick={() => alert("Simulated Auth successful!")} className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-lg py-2 mt-5 text-xs font-bold font-sans transition-colors shadow-sm">
            Authenticate Session
          </button>
        </div>
      )
    },
    {
      id: "postgres-tables",
      title: "SQL Tables Schema",
      command: "build analytics table in database schema and configure queries",
      icon: Database,
      color: "bg-emerald-500",
      badge: "Drizzle / Postgres",
      tasks: [
        {
          name: "Analyze Database Schema Specs",
          subtasks: [
            "Validate SQL syntax against PostgreSQL dialect engines",
            "Synthesize analytics schema parameters with indexes",
            "Prepare automatic up/down schema migration scripts"
          ]
        },
        {
          name: "Execute Relational Table Migrations",
          subtasks: [
            "Trigger background pg client transaction logs",
            "Register table references inside workspace ORM schemas",
            "Seed database tables with preliminary mock data logs"
          ]
        },
        {
          name: "Hook API Route Proxy Interface",
          subtasks: [
            "Add backend endpoint route: /api/analytics",
            "Configure SQL select performance query layers"
          ]
        }
      ],
      workspaceInjections: [
        { path: "src/generated/database", type: "folder" },
        { path: "src/generated/database/schema_analytics.ts", type: "file", content: "// Postgres analytics table declarations" },
        { path: "src/generated/database/queries.ts", type: "file", content: "// Postgres client query handlers" }
      ],
      mockAppContent: (
        <div className="p-5 bg-zinc-950 text-zinc-100 h-full flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
            <span className="text-emerald-500 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              POSTGRESQL RELATIONAL CONSOLE
            </span>
            <span className="text-[9px] text-zinc-500">DATABASE: connected</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            <div className="text-zinc-400">postgres=# SELECT * FROM analytics LIMIT 3;</div>
            <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg text-[10px] space-y-1">
              <div className="border-b border-zinc-800 pb-1 text-zinc-500 flex justify-between font-bold">
                <span>id</span>
                <span>endpoint</span>
                <span>response_ms</span>
                <span>timestamp</span>
              </div>
              <div className="flex justify-between">
                <span>1</span>
                <span>/api/messages</span>
                <span>42ms</span>
                <span>17:24:18</span>
              </div>
              <div className="flex justify-between">
                <span>2</span>
                <span>/api/db-status</span>
                <span>12ms</span>
                <span>17:24:20</span>
              </div>
              <div className="flex justify-between">
                <span>3</span>
                <span>/api/tasks/stream</span>
                <span>8ms</span>
                <span>17:24:22</span>
              </div>
            </div>
            <div className="text-zinc-500 text-[10px] mt-2">
              (3 rows returned in 2.14ms. Table "analytics" is successfully indexed by transaction worker).
            </div>
          </div>
        </div>
      )
    }
  ];

  // Sync scroll on logs
  useEffect(() => {
    eventLogsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventLogs]);

  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const appendLog = (type: LogMessage["type"], text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setEventLogs(prev => [...prev, { timestamp, type, text }]);
  };

  const startSimulation = async () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setCurrentPhase("phase1");
    setEventLogs([]);
    setPreviewState("idle");
    
    // Clear back to initial filesystem
    setVisibleFiles([
      { path: "src/App.tsx", type: "file" },
      { path: "src/main.tsx", type: "file" },
      { path: "package.json", type: "file" },
    ]);

    // Format tasks structure
    const promptValue = customCommand.trim() || activeTemplate.command;
    const initialTasks: SimulatedTask[] = activeTemplate.tasks.map((t, tIdx) => ({
      id: `sim-task-${tIdx}`,
      name: t.name,
      status: "pending",
      progress: 0,
      subtasks: t.subtasks.map((sub, sIdx) => ({
        id: `sim-task-${tIdx}-sub-${sIdx}`,
        name: sub,
        status: "pending",
        progress: 0,
        logs: []
      }))
    }));

    setSimulatedTasks(initialTasks);

    // --- PHASE 1: PRE-ANALYSIS ---
    appendLog("event", `[FRONTEND] User dispatched task command: "${promptValue}"`);
    await sleep(600);
    appendLog("system", `[PHASE 1] Instantly broadcasted event: "analysis_started"`);
    await sleep(800);
    appendLog("llama", `[PHASE 1] Sovereign Llama 3.3-70B processing user request rules...`);
    await sleep(1000);
    appendLog("llama", `[PHASE 1] Validating architectural security boundaries & constraints.`);
    await sleep(900);
    appendLog("system", `[PHASE 1] Resolved roadmap JSON array response.`);
    appendLog("event", `[PHASE 1] Instantly broadcasted event: "roadmap_ready"`);
    
    // Auto-update tasks list to empty rows in UI
    setCurrentPhase("phase2");
    appendLog("success", `[FRONTEND] Empty accordion layout panels rendered in Task Compiler container.`);
    await sleep(800);

    // --- PHASE 2: STREAMING LOOP ---
    // Iterate through tasks
    for (let tIdx = 0; tIdx < initialTasks.length; tIdx++) {
      const activeTask = { ...initialTasks[tIdx] };
      activeTask.status = "running";
      setActiveAccordionId(activeTask.id);
      
      setSimulatedTasks(prev => {
        const copy = [...prev];
        copy[tIdx] = activeTask;
        return copy;
      });

      appendLog("event", `[PHASE 2] Server broadcasted: "task_running" for Task ${tIdx + 1}`);
      await sleep(600);

      const subs = [...activeTask.subtasks];
      for (let sIdx = 0; sIdx < subs.length; sIdx++) {
        const activeSub = { ...subs[sIdx] };
        activeSub.status = "running";
        activeSub.logs = [`[SYSTEM] Handshaking worker thread for: "${activeSub.name}"...`];
        
        subs[sIdx] = activeSub;
        activeTask.subtasks = subs;
        setSimulatedTasks(prev => {
          const copy = [...prev];
          copy[tIdx] = { ...activeTask };
          return copy;
        });

        // Simulating step progress log updates
        const steps = [
          `Allocating local sandbox container workspace indices...`,
          `Spawning Cloudflare Fiber background worker execution thread...`,
          `Synchronizing SQL/SQLite tracking database table references...`,
          `Writing file outputs securely inside directory schemas...`
        ];

        for (let stepIdx = 0; stepIdx < steps.length; stepIdx++) {
          await sleep(500);
          activeSub.logs.push(`[${new Date().toLocaleTimeString([], { hour12: false })}] ${steps[stepIdx]}`);
          activeSub.progress = Math.round(((stepIdx + 1) / steps.length) * 100);
          
          subs[sIdx] = activeSub;
          // Increment total task progress as subtasks complete
          activeTask.progress = Math.round(((sIdx * steps.length + (stepIdx + 1)) / (subs.length * steps.length)) * 100);
          activeTask.subtasks = subs;

          setSimulatedTasks(prev => {
            const copy = [...prev];
            copy[tIdx] = { ...activeTask };
            return copy;
          });

          // Send real-time log stream
          appendLog("system", `[PHASE 2] Server emitted "task_progress": ${steps[stepIdx].substring(0, 45)}...`);
        }

        activeSub.status = "completed";
        activeSub.progress = 100;
        activeSub.logs.push(`[SUCCESS] "${activeSub.name}" completed successfully.`);
        
        subs[sIdx] = activeSub;
        activeTask.subtasks = subs;
        setSimulatedTasks(prev => {
          const copy = [...prev];
          copy[tIdx] = { ...activeTask };
          return copy;
        });

        await sleep(400);
      }

      // Complete high level task
      activeTask.status = "completed";
      activeTask.progress = 100;
      setSimulatedTasks(prev => {
        const copy = [...prev];
        copy[tIdx] = activeTask;
        return copy;
      });

      appendLog("success", `[PHASE 2] Task ${tIdx + 1} completed. Emitted: "task_completed"`);
      await sleep(600);
    }

    // --- PHASE 3: STATE RENDERING ACTION ---
    setCurrentPhase("phase3");
    appendLog("event", `[PHASE 3] Initiating Synchronous Workspace State Refresh...`);
    await sleep(600);

    // Block A: File explorer update
    appendLog("system", `[PHASE 3: BLOCK A] Dispatching internal workspace listing fetch...`);
    await sleep(700);
    
    // Injects files with animation
    const injections = activeTemplate.workspaceInjections;
    for (const inj of injections) {
      setVisibleFiles(prev => [...prev, inj]);
      appendLog("success", `[PHASE 3: BLOCK A] Sidebar Virtual DOM node injected: ${inj.path}`);
      await sleep(400);
    }

    // Block B: Preview View Update
    appendLog("system", `[PHASE 3: BLOCK B] Initiating sandbox compiler Hot-Reload...`);
    setPreviewState("reloading");
    setPreviewReloading(true);
    await sleep(1500);
    
    setPreviewReloading(false);
    setPreviewState("live");
    appendLog("success", `[PHASE 3: BLOCK B] Webview client hot-reload complete. App state rendering live!`);
    await sleep(800);

    // --- WRAP-UP ---
    setCurrentPhase("finished");
    appendLog("success", `[FINISH] Event "stream_finished" emitted. Pipeline returned to Idle status.`);
    setIsSimulating(false);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 p-4 sm:p-6 overflow-y-auto font-sans text-gray-800">
      
      {/* Upper Descriptive Header card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl border border-pink-100 shrink-0">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 font-display">
                Sovereign Sub-Tasks Pipeline Sandbox
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 font-sans">
                Observe the complete 3-Phase Event-Driven lifecycle mapping user inputs to live working code assets.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
              isSimulating ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse" : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isSimulating ? "bg-amber-500" : "bg-emerald-500"}`} />
              PIPELINE {isSimulating ? "SIMULATING" : "IDLE"}
            </span>
          </div>
        </div>

        {/* Templates Selector Grid */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-3">Select a Blueprint task template</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {templates.map(t => {
              const Icon = t.icon;
              const isSelected = selectedTemplateId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (isSimulating) return;
                    setSelectedTemplateId(t.id);
                    setCustomCommand("");
                  }}
                  disabled={isSimulating}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected 
                      ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                      : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-xl ${isSelected ? "bg-white/10 text-white" : "bg-white text-gray-500 border border-gray-200"} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      isSelected ? "bg-white/10 text-white" : "bg-gray-250 text-gray-500"
                    }`}>{t.badge}</span>
                  </div>
                  <h5 className="font-bold text-xs font-display mt-3 truncate">{t.title}</h5>
                  <p className={`text-[10px] mt-1 font-mono truncate ${isSelected ? "text-slate-300" : "text-gray-400"}`}>
                    "{t.command}"
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input bar for custom dispatch */}
        <div className="mt-5 bg-gray-50 border border-gray-150 p-1.5 rounded-full flex items-center gap-2">
          <input
            type="text"
            placeholder="Or type a custom task prompt (e.g., 'create a folder named dashboard')..."
            value={customCommand}
            onChange={(e) => setCustomCommand(e.target.value)}
            disabled={isSimulating}
            className="flex-1 bg-transparent px-4 text-xs text-gray-800 font-sans focus:outline-none placeholder-gray-400 disabled:opacity-50"
          />
          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className="bg-black hover:bg-zinc-800 disabled:bg-gray-200 text-white disabled:text-gray-400 px-5 py-2 rounded-full text-xs font-bold font-sans flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            {isSimulating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white" />
                Dispatch Task
              </>
            )}
          </button>
        </div>
      </div>

      {/* THREE PHASES SEQUENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* COLUMN 1: EVENT PIPELINE LOGS (PHASE 1) */}
        <div className="border border-gray-100 rounded-3xl bg-white p-5 flex flex-col h-[520px] shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-700 font-mono">Server Event Stream</span>
            </div>
            <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold uppercase">Phase 1 Pipeline</span>
          </div>

          {/* Logs View Container */}
          <div className="flex-1 bg-gray-950 rounded-2xl p-4 font-mono text-[10px] sm:text-xs overflow-y-auto space-y-2 text-gray-300 scrollbar-thin">
            {eventLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 px-4">
                <Terminal className="h-8 w-8 text-gray-800 mb-2 stroke-1" />
                <p>Waiting for task dispatch instructions to activate event stream pipeline...</p>
              </div>
            ) : (
              eventLogs.map((log, idx) => {
                let colorClass = "text-slate-400";
                if (log.type === "event") colorClass = "text-sky-400 font-bold";
                if (log.type === "llama") colorClass = "text-pink-400";
                if (log.type === "success") colorClass = "text-emerald-400";
                if (log.type === "warning") colorClass = "text-amber-400";
                
                return (
                  <div key={idx} className="leading-relaxed border-b border-gray-900/30 pb-1 flex items-start gap-1.5">
                    <span className="text-gray-600 text-[9px] select-none shrink-0">[{log.timestamp}]</span>
                    <span className={colorClass}>{log.text}</span>
                  </div>
                );
              })
            )}
            <div ref={eventLogsEndRef} />
          </div>
        </div>

        {/* COLUMN 2: TASK ACCORDION GENERATION (PHASE 2) */}
        <div className="border border-gray-100 rounded-3xl bg-white p-5 flex flex-col h-[520px] shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-700 font-mono">Task Compiler (D1/SQLite)</span>
            </div>
            <span className="text-[9px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-bold uppercase">Phase 2 Loop</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {simulatedTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-4">
                <Cpu className="h-8 w-8 text-gray-250 mb-2 stroke-1" />
                <p className="text-xs">No roadmap resolved. Select a template and press "Dispatch" to construct roadmap accordion elements.</p>
              </div>
            ) : (
              simulatedTasks.map((task, tIdx) => {
                const isOpen = activeAccordionId === task.id;
                return (
                  <div 
                    key={task.id} 
                    className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                      isOpen ? "border-amber-300 shadow-sm" : "border-gray-100"
                    }`}
                  >
                    {/* Header */}
                    <div 
                      onClick={() => setActiveAccordionId(isOpen ? null : task.id)}
                      className="p-3 bg-linear-to-r from-gray-50/50 to-white hover:from-gray-50 transition-colors flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : task.status === "running" ? (
                          <Loader2 className="h-4 w-4 text-amber-500 animate-spin shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-gray-300 shrink-0" />
                        )}
                        <h6 className="font-semibold text-xs text-gray-800 truncate font-display">{task.name}</h6>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] font-mono text-gray-400">{task.progress}%</span>
                        {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expandable Subtask Rows */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="bg-gray-50 border-t border-gray-100 p-3 space-y-2.5"
                        >
                          {task.subtasks.map((sub, sIdx) => (
                            <div key={sub.id} className={`p-2.5 rounded-lg border shadow-xs transition-all duration-300 ${
                              sub.status === "completed" ? "bg-emerald-50/20 border-emerald-200/80" : "bg-white border-gray-150/60"
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {sub.status === "completed" ? (
                                    <span className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-600 font-bold">✓</span>
                                  ) : (
                                    <span className="text-[10px] font-mono font-bold text-gray-400">Step {sIdx + 1}</span>
                                  )}
                                  {sub.status === "completed" && (
                                    <span className="text-[9px] font-bold text-emerald-600">Verified Success</span>
                                  )}
                                </div>
                                <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 rounded-md font-bold ${
                                  sub.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-150/50" :
                                  sub.status === "running" ? "bg-amber-50 text-amber-600 animate-pulse" : "bg-gray-100 text-gray-400"
                                }`}>{sub.status}</span>
                              </div>
                              <p className="text-[11px] font-medium text-gray-800 mt-1">{sub.name}</p>

                              {/* Nested micro log timeline inside Accordion content box */}
                              {sub.logs.length > 0 && (
                                <div className="mt-2 bg-slate-900 text-slate-300 p-2 rounded-md font-mono text-[9px] max-h-24 overflow-y-auto space-y-1">
                                  {sub.logs.map((subl, sLogIdx) => (
                                    <div key={sLogIdx} className="leading-tight">{subl}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: STATE RENDERING (PHASE 3) */}
        <div className="border border-gray-100 rounded-3xl bg-white p-5 flex flex-col h-[520px] shadow-xs gap-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-700 font-mono">Workspace Visualizers</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold uppercase">Phase 3 State</span>
          </div>

          {/* Block A: File Explorer Updater */}
          <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100 p-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wider pb-2 border-b border-gray-150 shrink-0">
              <span className="flex items-center gap-1"><Folder className="h-3.5 w-3.5" /> File Explorer Tree</span>
              <span>STATE ACTION A</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 text-xs font-mono text-gray-600">
              {visibleFiles.map((file, fIdx) => (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between px-2.5 py-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.type === "folder" ? (
                      <Folder className="h-3.5 w-3.5 text-blue-400 fill-blue-100 shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    )}
                    <span className="truncate">{file.path}</span>
                  </div>
                  {fIdx >= 3 && (
                    <span className="text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold font-sans rounded px-1 animate-bounce shrink-0">
                      NEW NODE
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Block B: Live Webview Sandbox */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col min-h-0 relative shadow-inner">
            <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-150 flex items-center justify-between text-[9px] font-mono text-gray-500 shrink-0">
              <span>https://sandbox.trinity.io/</span>
              <span>STATE ACTION B</span>
            </div>

            <div className="flex-1 relative min-h-0 bg-slate-900">
              {previewState === "idle" && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Monitor className="h-8 w-8 text-slate-700 mb-2 stroke-1" />
                  <p className="text-[11px] font-mono text-slate-500">Iframe preview sandbox offline. Start simulation to compile server render.</p>
                </div>
              )}

              {previewState === "reloading" && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-950/90 text-slate-300">
                  <RefreshCw className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                  <p className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider animate-pulse">Hot Reload Active</p>
                  <p className="text-[9px] font-mono text-slate-500 mt-1">Recompiling modules to headless render browser view...</p>
                </div>
              )}

              {previewState === "live" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full"
                >
                  {activeTemplate.mockAppContent}
                </motion.div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
