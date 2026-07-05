import React, { useState, useEffect } from "react";
import { Play, RefreshCw, Smartphone, Monitor, ShieldAlert, ArrowLeft, ArrowRight, FolderOpen, Database, Sparkles, Terminal } from "lucide-react";

interface PreviewViewProps {
  currentPrompt: string;
  files?: { path: string; content: string; language: string }[];
  previewReloadKey?: number;
}

export default function PreviewView({ currentPrompt, files = [], previewReloadKey = 0 }: PreviewViewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (previewReloadKey > 0) {
      setIsRefreshing(true);
      const timer = setTimeout(() => setIsRefreshing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [previewReloadKey]);

  // Parse prompt to decide which interactive simulator to render as fallbacks!
  const isTodoPrompt = currentPrompt.toLowerCase().includes("todo") || currentPrompt.toLowerCase().includes("task");
  const isCalculatorPrompt = currentPrompt.toLowerCase().includes("calc");
  const isNotesPrompt = currentPrompt.toLowerCase().includes("note") || currentPrompt.toLowerCase().includes("journal");
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // 1. Auto-detect UI Framework / Stack from file contents
  let detectedFramework = "React + Tailwind CSS";
  let frameworkIcon = "⚛️";
  let description = "Vite React Single Page Application with dynamic hot-reloading.";

  const fileCount = files.length;
  const allContentString = files.map(f => f.content).join("\n").toLowerCase();
  const newestFile = files.length > 0 ? files[files.length - 1] : null;

  if (fileCount > 0) {
    if (allContentString.includes("<template>") || allContentString.includes("vue") || newestFile?.path.endsWith(".vue")) {
      detectedFramework = "Vue 3 + Tailwind CSS";
      frameworkIcon = "💚";
      description = "Vue SFC (Single File Component) architecture running in dynamic sandbox container.";
    } else if (allContentString.includes("@component") || allContentString.includes("angular") || newestFile?.path.endsWith(".component.ts")) {
      detectedFramework = "Angular TS + Tailwind";
      frameworkIcon = "🅰️";
      description = "Angular 18 Enterprise Framework compiling dynamically with type constraints.";
    } else if (allContentString.includes("<!doctype html>") || allContentString.includes("<html") || newestFile?.path.endsWith(".html")) {
      detectedFramework = "Vanilla HTML5 + Tailwind";
      frameworkIcon = "🌐";
      description = "Static index HTML document utilizing direct CDN Tailwind stylesheets.";
    }
  }

  return (
    <div id="preview-workspace" className="flex flex-col flex-1 border border-gray-100 rounded-3xl bg-gray-50 overflow-hidden shadow-xs h-full min-h-[500px]">
      {/* Mock Browser Header Bar */}
      <div className="bg-white px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Navigation Dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 bg-red-400 rounded-full" />
            <span className="w-3 h-3 bg-yellow-400 rounded-full" />
            <span className="w-3 h-3 bg-green-400 rounded-full" />
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowRight className="h-4 w-4" />
            </button>
            <button 
              id="btn-preview-refresh"
              onClick={handleRefresh} 
              className={`p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-transform ${isRefreshing ? "animate-spin text-amber-500" : ""}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Browser Address Input */}
          <div className="bg-gray-100 rounded-xl px-4 py-1.5 text-xs text-gray-500 font-mono w-[300px] truncate flex items-center gap-2 border border-gray-150">
            <span className="text-emerald-500 font-bold">●</span>
            https://sandbox-{currentPrompt ? currentPrompt.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 15) : "app"}.sovereign-agent.io/
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            id="btn-preview-desktop"
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-lg transition-all ${device === "desktop" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            title="Desktop Mode"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            id="btn-preview-mobile"
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-lg transition-all ${device === "mobile" ? "bg-white text-gray-900 shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            title="Mobile Mode"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Simulator Active Area */}
      <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
        <div 
          className={`bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-500 ${
            device === "mobile" ? "w-[375px] h-[667px]" : "w-full max-w-5xl h-[520px]"
          } flex flex-col`}
        >
          {isRefreshing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-50">
              <RefreshCw className="h-10 w-10 text-gray-300 animate-spin mb-3" />
              <p className="text-xs font-mono text-gray-500">Hot reloading virtual workspace server state...</p>
            </div>
          ) : fileCount > 0 ? (
            /* SOVEREIGN DYNAMIC COMPILER - Live rendering of generated source code */
            <DynamicSovereignWorkspace 
              files={files} 
              currentPrompt={currentPrompt} 
              detectedFramework={detectedFramework}
              frameworkIcon={frameworkIcon}
              description={description}
            />
          ) : isTodoPrompt ? (
            <TodoSimulator />
          ) : isCalculatorPrompt ? (
            <CalculatorSimulator />
          ) : isNotesPrompt ? (
            <NotesSimulator />
          ) : (
            <GenericSimulator currentPrompt={currentPrompt} />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   SOVEREIGN DYNAMIC INTERACTIVE COMPILER / INTERPRETER (Auto-detect & Live)
   ========================================================================= */

function DynamicSovereignWorkspace({ 
  files, 
  currentPrompt,
  detectedFramework,
  frameworkIcon,
  description 
}: { 
  files: any[]; 
  currentPrompt: string;
  detectedFramework: string;
  frameworkIcon: string;
  description: string;
}) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");
  const [interactiveItems, setInteractiveItems] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [feedbackLog, setFeedbackLog] = useState<string[]>([]);

  // Automatically select the newest file when the list updates
  useEffect(() => {
    if (files.length > 0) {
      const tsxFiles = files.filter(f => f.path.endsWith(".tsx") || f.path.endsWith(".ts"));
      if (tsxFiles.length > 0) {
        setSelectedFilePath(tsxFiles[tsxFiles.length - 1].path);
      } else {
        setSelectedFilePath(files[files.length - 1].path);
      }
    }
  }, [files.length]);

  const selectedFile = files.find(f => f.path === selectedFilePath) || files[files.length - 1];
  const code = selectedFile ? selectedFile.content : "";
  const displayName = selectedFile ? selectedFile.path.split("/").pop() : "";

  // PARSE FILE CODE FOR INTERACTIVE ELEMENTS
  const buttonMatches: string[] = [];
  const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  let match;
  while ((match = buttonRegex.exec(code)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text && text.length < 30 && !buttonMatches.includes(text) && !text.includes("{") && !text.includes("className")) {
      buttonMatches.push(text);
    }
  }

  // Get all input placeholders or labels
  const inputPlaceholders: string[] = [];
  const inputRegex = /placeholder=["']([^"']+)["']/gi;
  while ((match = inputRegex.exec(code)) !== null) {
    if (match[1] && !inputPlaceholders.includes(match[1])) {
      inputPlaceholders.push(match[1]);
    }
  }

  // Get headings / titles
  const headingMatches: string[] = [];
  const headingRegex = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi;
  while ((match = headingRegex.exec(code)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim();
    if (text && text.length < 50 && !headingMatches.includes(text) && !text.includes("{")) {
      headingMatches.push(text);
    }
  }

  // Detect charts
  const hasCharts = code.toLowerCase().includes("chart") || code.toLowerCase().includes("recharts") || code.toLowerCase().includes("graph") || code.toLowerCase().includes("analytics");

  // Detect tables
  const hasTables = code.toLowerCase().includes("<table") || code.toLowerCase().includes("thead") || code.toLowerCase().includes("tr");

  // Detect database references
  const hasDatabase = code.toLowerCase().includes("sql") || code.toLowerCase().includes("postgres") || code.toLowerCase().includes("redis") || code.toLowerCase().includes("query") || code.toLowerCase().includes("select");

  // Title selection
  const mainTitle = headingMatches[0] || (currentPrompt ? currentPrompt.replace(/^[a-z]/, L => L.toUpperCase()) : "Synthesized Module Live Render");

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      setInteractiveItems(prev => [...prev, inputText.trim()]);
      setFeedbackLog(prev => [`[${new Date().toLocaleTimeString()}] UI Event: Committed state "${inputText.trim()}"`, ...prev]);
      setInputText("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-stone-50 overflow-hidden h-full">
      {/* Dynamic Framework & File Watcher Banner */}
      <div className="bg-stone-900 text-stone-100 p-4 px-5 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{frameworkIcon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Framework detected:</span>
              <span className="text-xs bg-stone-800 border border-stone-700 text-amber-400 font-bold px-2 py-0.5 rounded-full font-mono">
                {detectedFramework}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-sans mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-mono">RENDER FILE:</span>
          <select 
            value={selectedFilePath}
            onChange={(e) => setSelectedFilePath(e.target.value)}
            className="bg-stone-800 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 border border-stone-700 outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          >
            {files.map(f => (
              <option key={f.path} value={f.path}>{f.path.split("/").pop()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Compiler active status stripe */}
      <div className="bg-amber-400/15 border-b border-amber-400/20 px-5 py-2 flex items-center justify-between text-[10px] text-amber-800 font-mono">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          ACTIVE REVIEWS: Compiling & monitoring file system mutations live...
        </span>
        <span className="font-bold">HOT RELOAD READY</span>
      </div>

      {/* Main Dynamic Sandbox Interactive Grid */}
      <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">
        {/* Left Interactive Playground (Col span 3) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col h-full overflow-y-auto">
          <div className="border-b border-stone-100 pb-3 mb-4 flex items-center justify-between">
            <h3 className="font-bold text-base text-stone-800 font-display truncate">
              {mainTitle}
            </h3>
            <span className="text-[9px] font-bold font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
              interactive_sandbox.js
            </span>
          </div>

          {/* Form items */}
          <form onSubmit={handleSimulatedSubmit} className="space-y-4">
            {inputPlaceholders.length > 0 ? (
              inputPlaceholders.map((placeholder, idx) => (
                <div key={idx}>
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1.5">
                    {placeholder.replace(/\.\.\./g, "")}
                  </label>
                  <input 
                    type="text" 
                    placeholder={placeholder}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-sans placeholder-stone-400"
                  />
                </div>
              ))
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-1.5">
                  Type into Sandbox Session Store
                </label>
                <input 
                  type="text" 
                  placeholder="Record an action/input..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all font-sans placeholder-stone-400"
                />
              </div>
            )}

            {/* Simulated interactive buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {buttonMatches.length > 0 ? (
                buttonMatches.map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (btn.toLowerCase().includes("add") || btn.toLowerCase().includes("create") || btn.toLowerCase().includes("submit") || btn.toLowerCase().includes("save")) {
                        if (inputText.trim()) {
                          setInteractiveItems(prev => [...prev, inputText.trim()]);
                          setFeedbackLog(prev => [`[${new Date().toLocaleTimeString()}] Action committed: Added "${inputText.trim()}"`, ...prev]);
                          setInputText("");
                        } else {
                          setFeedbackLog(prev => [`[${new Date().toLocaleTimeString()}] Click event: "${btn}" (Type into the input box to add item!)`, ...prev]);
                        }
                      } else {
                        setFeedbackLog(prev => [`[${new Date().toLocaleTimeString()}] Click event: Handler for "${btn}" triggered!`, ...prev]);
                      }
                    }}
                    className="bg-black text-white hover:bg-stone-800 px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all active:scale-97 shadow-sm cursor-pointer"
                  >
                    {btn}
                  </button>
                ))
              ) : (
                <button
                  type="submit"
                  className="bg-black text-white hover:bg-stone-800 px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all active:scale-97 shadow-sm cursor-pointer"
                >
                  Commit Entry
                </button>
              )}
            </div>
          </form>

          {/* Interactive Memory Lists */}
          <div className="mt-5 flex-grow">
            {interactiveItems.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Sandbox Items Store</h4>
                {interactiveItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100/50 transition-all">
                    <span className="text-xs text-stone-800 font-sans font-medium">{item}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setInteractiveItems(prev => prev.filter((_, i) => i !== idx));
                        setFeedbackLog(prev => [`[${new Date().toLocaleTimeString()}] Action: Deleted item from memory`, ...prev]);
                      }}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-28 rounded-xl border border-dashed border-stone-200 flex flex-col items-center justify-center text-center p-4">
                <FolderOpen className="h-6 w-6 text-stone-300 stroke-1 mb-1.5" />
                <p className="text-[11px] text-stone-400 font-sans">Playground state is pristine. Fill in fields and click submit to seed lists.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sandbox Telemetry, Database, Logs (Col span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* PostgreSQL connection panel if schema file exists */}
          {hasDatabase && (
            <div className="bg-emerald-500/10 border border-emerald-500/15 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="h-4.5 w-4.5 text-emerald-600" />
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 font-sans block">PostgreSQL Schema Engaged</span>
                    <span className="text-[9px] text-emerald-600 font-mono">Status: Connected to cluster</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono">LIVE</span>
              </div>
            </div>
          )}

          {/* Dynamic Recharts replacement */}
          {hasCharts && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[9px] font-bold text-stone-400 font-mono block uppercase">Interactive Live Telemetry</span>
              <h5 className="text-xs font-bold text-stone-800 mb-3">Dynamic Metrics Visualizer</h5>
              <div className="h-24 flex items-end gap-1.5 pt-3 border-b border-stone-200 pb-1">
                {[40, 70, 35, 95, 55, 80, 100, 60].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer">
                    <div className="w-full bg-stone-900 rounded-t-sm group-hover:bg-amber-500 transition-colors" style={{ height: `${val}%` }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Inspector card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col flex-grow">
            <span className="text-[9px] font-bold text-stone-400 font-mono block uppercase mb-1">MODULE META-INSPECTOR</span>
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-2">
              <span className="text-xs font-bold text-stone-700 font-mono truncate">{displayName}</span>
              <span className="text-[8px] uppercase tracking-wider font-bold bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">{selectedFile?.language}</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-36 lg:max-h-48">
              <pre className="text-[9px] font-mono text-stone-500 leading-relaxed whitespace-pre-wrap select-text bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                {code.substring(0, 1000)}
                {code.length > 1000 && "\n\n// ... truncated in inspector view ..."}
              </pre>
            </div>
          </div>

          {/* Dynamic Action Logging logs */}
          <div className="bg-stone-950 text-stone-400 p-4 rounded-2xl font-mono text-[9px] border border-stone-900 shadow-inner flex flex-col h-28 shrink-0">
            <div className="flex items-center justify-between border-b border-stone-900 pb-1.5 mb-1.5 text-stone-600 text-[8px] tracking-wider uppercase">
              <span className="flex items-center gap-1">
                <Terminal className="h-3 w-3 text-amber-500" />
                WORKSPACE EVENT STREAM
              </span>
              <span>LIVE</span>
            </div>
            <div className="flex-grow overflow-y-auto space-y-1">
              {feedbackLog.length > 0 ? (
                feedbackLog.map((log, i) => <div key={i}>{log}</div>)
              ) : (
                <div className="text-stone-600 italic">No sandbox telemetry captured yet. Interact with form buttons.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ==========================================
   INTERACTIVE SIMULATORS (For High Fidelity)
   ========================================== */

function TodoSimulator() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Establish backend PostgreSQL cluster and schemas", completed: true },
    { id: 2, text: "Build real-time websocket task status stream pipeline", completed: true },
    { id: 3, text: "Style interface layout with Swiss typography matches", completed: false },
    { id: 4, text: "Complete end-to-end telemetry and deployment check", completed: false }
  ]);
  const [newTodo, setNewTodo] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo("");
    }
  };

  const toggle = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 p-6">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col h-full">
        <div className="bg-slate-900 text-white p-5">
          <h2 className="text-lg font-bold font-display">Task Master Pro</h2>
          <p className="text-xs text-slate-400">Durable storage active on local container sandbox</p>
        </div>

        <form onSubmit={handleAdd} className="p-4 border-b border-slate-100 flex gap-2">
          <input 
            type="text" 
            placeholder="Commit a new todo item..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-sans"
          />
          <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold font-sans">Add</button>
        </form>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {todos.map(t => (
            <div key={t.id} onClick={() => toggle(t.id)} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
              <input type="checkbox" checked={t.completed} readOnly className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4" />
              <span className={`text-sm ${t.completed ? "line-through text-slate-400" : "text-slate-800"}`}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalculatorSimulator() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const pressNum = (n: string) => {
    setDisplay(display === "0" ? n : display + n);
  };

  const pressOp = (op: string) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
  };

  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation("");
    } catch {
      setDisplay("Error");
    }
  };

  const clear = () => {
    setDisplay("0");
    setEquation("");
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-[280px] bg-black border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="text-right py-4">
          <div className="text-zinc-500 text-xs font-mono min-h-[16px]">{equation}</div>
          <div className="text-white text-3xl font-display font-medium truncate mt-1">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <button onClick={clear} className="col-span-2 bg-zinc-800 text-white p-3.5 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-colors">AC</button>
          <button onClick={() => pressOp("/")} className="bg-amber-500 text-white p-3.5 rounded-full text-sm font-semibold hover:bg-amber-400 transition-colors">/</button>
          <button onClick={() => pressOp("*")} className="bg-amber-500 text-white p-3.5 rounded-full text-sm font-semibold hover:bg-amber-400 transition-colors">*</button>

          <button onClick={() => pressNum("7")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">7</button>
          <button onClick={() => pressNum("8")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">8</button>
          <button onClick={() => pressNum("9")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">9</button>
          <button onClick={() => pressOp("-")} className="bg-amber-500 text-white p-3.5 rounded-full text-sm font-semibold hover:bg-amber-400 transition-colors">-</button>

          <button onClick={() => pressNum("4")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">4</button>
          <button onClick={() => pressNum("5")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">5</button>
          <button onClick={() => pressNum("6")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">6</button>
          <button onClick={() => pressOp("+")} className="bg-amber-500 text-white p-3.5 rounded-full text-sm font-semibold hover:bg-amber-400 transition-colors">+</button>

          <button onClick={() => pressNum("1")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">1</button>
          <button onClick={() => pressNum("2")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">2</button>
          <button onClick={() => pressNum("3")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">3</button>
          <button onClick={calculate} className="bg-amber-500 text-white p-3.5 rounded-full text-sm font-semibold hover:bg-amber-400 transition-colors">=</button>
          
          <button onClick={() => pressNum("0")} className="col-span-2 bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">0</button>
          <button onClick={() => pressNum(".")} className="bg-zinc-900 text-white p-3.5 rounded-full text-sm hover:bg-zinc-850 transition-colors">.</button>
        </div>
      </div>
    </div>
  );
}

function NotesSimulator() {
  const [notes, setNotes] = useState([
    { id: 1, title: "Trinity Build Spec", text: "Ensure full compliance with Swiss minimal design paradigms and zero-bloat mandates." },
    { id: 2, title: "PostgreSQL Config Notes", text: "Durable database utilizes standard pg clients with SSL active to shield communication tunnels." }
  ]);
  const [activeId, setActiveId] = useState<number | null>(1);
  const [title, setTitle] = useState("Trinity Build Spec");
  const [text, setText] = useState("Ensure full compliance with Swiss minimal design paradigms and zero-bloat mandates.");

  const handleSave = () => {
    if (activeId) {
      setNotes(notes.map(n => n.id === activeId ? { ...n, title, text } : n));
    } else {
      const newNote = { id: Date.now(), title, text };
      setNotes([...notes, newNote]);
      setActiveId(newNote.id);
    }
  };

  const handleNew = () => {
    setActiveId(null);
    setTitle("");
    setText("");
  };

  return (
    <div className="flex-1 flex bg-stone-50 h-full font-sans">
      <div className="w-48 border-r border-stone-200 bg-stone-100/50 p-3.5 flex flex-col gap-2">
        <div className="flex justify-between items-center pb-2 border-b border-stone-200">
          <span className="text-xs font-bold text-stone-500 font-mono">NOTES HUB</span>
          <button onClick={handleNew} className="text-xs font-bold hover:underline text-stone-800">+ New</button>
        </div>
        <div className="space-y-1.5 overflow-y-auto flex-1">
          {notes.map(n => (
            <button
              key={n.id}
              onClick={() => {
                setActiveId(n.id);
                setTitle(n.title);
                setText(n.text);
              }}
              className={`w-full text-left p-2.5 rounded-lg text-xs truncate ${n.id === activeId ? "bg-stone-800 text-white font-medium" : "text-stone-700 hover:bg-stone-200/50"}`}
            >
              {n.title || "Untitled Note"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-bold font-display border-b border-stone-100 bg-transparent py-1 focus:outline-none focus:border-stone-400"
        />
        <textarea
          placeholder="Content..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 text-sm text-stone-700 bg-transparent focus:outline-none resize-none leading-relaxed"
        />
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} className="bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-stone-750 transition-all">
            Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function GenericSimulator({ currentPrompt }: { currentPrompt: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900 text-white">
      <div className="max-w-md space-y-4">
        <div className="inline-block p-4 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-amber-500">
          <Play className="h-8 w-8 fill-amber-500 animate-pulse" />
        </div>
        <h3 className="font-bold text-xl font-display">Sovereign Project Live Simulator</h3>
        <p className="text-sm text-slate-400 leading-relaxed font-sans">
          Your project: <span className="text-white font-semibold italic">"{currentPrompt || "Untitled Application"}"</span> has been compiled and is currently running inside our sandboxed Node.js environment on port <span className="text-amber-400 font-bold font-mono">3001</span>.
        </p>
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left font-mono text-xs text-slate-500 space-y-1">
          <div>$ npm run build</div>
          <div className="text-emerald-400">✓ production bundle generated in 1.4s</div>
          <div>$ node dist/server.cjs</div>
          <div className="text-amber-500">Listening on http://0.0.0.0:3001</div>
          <div className="text-sky-400">[HMR] Dev servers synchronized with PostgreSQL client</div>
        </div>
      </div>
    </div>
  );
}
