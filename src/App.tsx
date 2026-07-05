import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  Zap, 
  MessageSquare, 
  Smartphone, 
  ChevronDown, 
  Code, 
  FileText, 
  Github, 
  ShieldCheck, 
  Settings, 
  Database, 
  Bell, 
  Camera, 
  Copy, 
  Download, 
  Plus, 
  Send, 
  RefreshCw, 
  Trash2,
  Cpu,
  Shield,
  Clock,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, Task, FileNode, DatabaseStatus } from "./types.js";
import TaskAccordion from "./components/TaskAccordion.tsx";
import CodeView from "./components/CodeView.tsx";
import PreviewView from "./components/PreviewView.tsx";
import DbVisualizer from "./components/DbVisualizer.tsx";
import SettingsModal from "./components/SettingsModal.tsx";
import DeployView from "./components/DeployView.tsx";
import GithubView from "./components/GithubView.tsx";
import PermissionsView from "./components/PermissionsView.tsx";
import SupabaseView from "./components/SupabaseView.tsx";
import NotificationsView from "./components/NotificationsView.tsx";
import ScreenshotsView from "./components/ScreenshotsView.tsx";
import SettingsView from "./components/SettingsView.tsx";
import SubtasksSimulationView from "./components/SubtasksSimulationView.tsx";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "chat" | "preview" | "code" | "database" | "logs" | "deploy" | "github" | "permissions" | "settings" | "supabase" | "notifications" | "screenshots" | "simulation"
  >("chat");
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Data States
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({ postgres: "local_fallback", redis: "local_fallback" });
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  // System States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConnectedSSE, setIsConnectedSSE] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Chat History / Multi-session states
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem("trinity_active_session_id") || "session-" + Date.now();
  });
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [previewReloadKey, setPreviewReloadKey] = useState<number>(0);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(false);

  // Load chat history index on start
  useEffect(() => {
    const saved = localStorage.getItem("trinity_saved_sessions");
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved sessions:", e);
      }
    }
  }, []);

  // Save current session progress automatically as it grows
  useEffect(() => {
    const hasActualContent = messages.length > 1 || files.length > 0 || tasks.length > 0;
    if (!hasActualContent) return;

    const firstUserMsg = messages.find(m => m.role === "user");
    const title = firstUserMsg ? firstUserMsg.content : "Workspace Session";

    const sessionData = {
      id: activeSessionId,
      title: title.substring(0, 60) + (title.length > 60 ? "..." : ""),
      messages,
      tasks,
      files,
      currentPrompt,
      lastUpdated: new Date().toISOString()
    };

    const saved = localStorage.getItem("trinity_saved_sessions");
    let sessionsList: any[] = saved ? JSON.parse(saved) : [];

    const existingIdx = sessionsList.findIndex(s => s.id === activeSessionId);
    if (existingIdx >= 0) {
      sessionsList[existingIdx] = sessionData;
    } else {
      sessionsList.unshift(sessionData);
    }

    localStorage.setItem("trinity_saved_sessions", JSON.stringify(sessionsList));
    localStorage.setItem("trinity_active_session_id", activeSessionId);
    setSavedSessions(sessionsList);
  }, [messages, tasks, files, currentPrompt, activeSessionId]);

  const handleStartFreshChat = async () => {
    setIsSidebarOpen(false);
    setActiveTab("chat");
    
    // Clear state on backend
    await handleClearSession();
    
    // Create new session ID
    const newSessionId = "session-" + Date.now();
    setActiveSessionId(newSessionId);
    localStorage.setItem("trinity_active_session_id", newSessionId);
    
    // Clear local state
    setMessages([]);
    setTasks([]);
    setFiles([]);
    setCurrentPrompt("");
  };

  const handleLoadSession = async (session: any) => {
    setIsLoadingSession(true);
    setActiveSessionId(session.id);
    localStorage.setItem("trinity_active_session_id", session.id);
    
    // 1. Sync React States instantly
    setMessages(session.messages || []);
    setTasks(session.tasks || []);
    setFiles(session.files || []);
    setCurrentPrompt(session.currentPrompt || "");

    // 2. Sync to Express Backend
    try {
      await fetch("/api/session/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: session.messages || [],
          tasks: session.tasks || [],
          files: session.files || []
        })
      });
    } catch (err) {
      console.error("Error syncing session load to backend:", err);
    } finally {
      setIsLoadingSession(false);
    }

    // 3. Navigate to preview and trigger the "spin its UI in live preview"
    setActiveTab("preview");
    setPreviewReloadKey(prev => prev + 1);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent load
    const saved = localStorage.getItem("trinity_saved_sessions");
    if (!saved) return;
    try {
      let sessionsList: any[] = JSON.parse(saved);
      sessionsList = sessionsList.filter(s => s.id !== sessionId);
      localStorage.setItem("trinity_saved_sessions", JSON.stringify(sessionsList));
      setSavedSessions(sessionsList);

      if (activeSessionId === sessionId) {
        handleStartFreshChat();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data & connect to live stream
  useEffect(() => {
    fetchInitialData();
    connectSSE();
  }, []);

  // Auto-scroll chat on new message or task activity
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tasks]);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch DB Statuses
      const statusRes = await fetch("/api/db-status");
      const statusData = await statusRes.json();
      setDbStatus({ postgres: statusData.postgres, redis: statusData.redis });

      // 2. Fetch Chat History
      const msgRes = await fetch("/api/messages");
      const msgData = await msgRes.json();
      setMessages(msgData);

      // 3. Fetch Active Tasks
      const taskRes = await fetch("/api/tasks");
      const taskData = await taskRes.json();
      setTasks(taskData);

      // 4. Fetch Synthesized Files
      const fileRes = await fetch("/api/files");
      const fileData = await fileRes.json();
      setFiles(fileData);

      // Extract current prompt if tasks are active
      if (taskData.length > 0) {
        setCurrentPrompt(taskData[0].name);
      }
    } catch (err) {
      console.error("Failed to load initial workspace data:", err);
    }
  };

  const connectSSE = () => {
    console.log("Establishing Server-Sent Events real-time connection...");
    const eventSource = new EventSource("/api/tasks/stream");

    eventSource.onopen = () => {
      setIsConnectedSSE(true);
      console.log("SSE Pipeline active.");
    };

    eventSource.onerror = (e) => {
      setIsConnectedSSE(false);
      console.error("SSE connection dropped, retrying in 5s...", e);
      eventSource.close();
      setTimeout(connectSSE, 5000);
    };

    // Listen to events
    eventSource.addEventListener("connected", (e: any) => {
      const data = JSON.parse(e.data);
      console.log("SSE Pipeline Handshake:", data);
      if (data && data.status === "refreshed") {
        fetchInitialData();
      }
    });

    eventSource.addEventListener("build-started", (e: any) => {
      const data = JSON.parse(e.data);
      setCurrentPrompt(data.prompt);
      // Clear tasks locally as new run begins
      setTasks([]);
    });

    eventSource.addEventListener("task-update", (e: any) => {
      const updatedTask = JSON.parse(e.data) as Task;
      setTasks(prevTasks => {
        const idx = prevTasks.findIndex(t => t.id === updatedTask.id);
        if (idx >= 0) {
          const next = [...prevTasks];
          next[idx] = updatedTask;
          return next;
        } else {
          return [updatedTask, ...prevTasks];
        }
      });
    });

    eventSource.addEventListener("file-created", (e: any) => {
      const newFile = JSON.parse(e.data) as FileNode;
      setFiles(prevFiles => {
        const idx = prevFiles.findIndex(f => f.path === newFile.path);
        if (idx >= 0) {
          const next = [...prevFiles];
          next[idx] = newFile;
          return next;
        } else {
          return [...prevFiles, newFile];
        }
      });
    });

    eventSource.addEventListener("build-finished", (e: any) => {
      const finishMsg = JSON.parse(e.data) as Message;
      setMessages(prev => [...prev, finishMsg]);
      // Sync complete task tree
      fetchInitialData();
    });

    eventSource.addEventListener("session-cleared", () => {
      setMessages([]);
      setTasks([]);
      setFiles([]);
      setCurrentPrompt("");
    });

    eventSource.addEventListener("plan-awaiting-approval", (e: any) => {
      const data = JSON.parse(e.data);
      if (data && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    });

    eventSource.addEventListener("plan-approved", () => {
      fetchInitialData();
    });

    eventSource.addEventListener("plan-rejected", () => {
      fetchInitialData();
    });

    return () => {
      eventSource.close();
    };
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userText = inputText;
    setInputText("");
    setIsSending(true);

    // Optimistically add user message
    const optimMsg: Message = {
      id: `msg-optim-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: userText }),
      });

      if (!res.ok) {
        throw new Error("Failed to dispatch build instructions.");
      }

      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        setCurrentPrompt(userText);
      }
    } catch (err: any) {
      console.error("Failed sending prompt:", err);
      // Append fail message
      setMessages(prev => [...prev, {
        id: `msg-err-${Date.now()}`,
        role: "system",
        content: `⚠️ **Transmission Error:** ${err.message}. Make sure your Gemini API key is configured.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleApprovalDecision = async (buildId: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${approve ? "approve" : "reject"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildId }),
      });
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (err) {
      console.error("Failed to resolve approval decision:", err);
    }
  };

  const handleUpdateFile = async (path: string, content: string) => {
    // Send a mock commit back to workspace database
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We can reuse the API settings router or direct endpoint to write file
      });
      // Update local cache
      setFiles(files.map(f => f.path === path ? { ...f, content } : f));
    } catch (e) {
      console.error("Save code file error:", e);
    }
  };

  const handleClearSession = async () => {
    try {
      await fetch("/api/session/clear", { method: "POST" });
    } catch (e) {
      console.error("Purge error:", e);
    }
  };

  // Create unified chronology timeline of messages and tasks grouped by logical interaction turns
  // This guarantees that the user's prompt always stays on top of its associated tasks,
  // preventing prompts from dropping below tasks due to potential client/server clock skews,
  // and implements sequential task disclosure by filtering out pending tasks.
  const userMessages = messages.filter(m => m.role === "user");

  // Helper to find the associated user message for a non-user item (task or assistant message)
  const getAssociatedUserMessageId = (itemTimestamp: string, isAssistantMessage: boolean = false) => {
    if (userMessages.length === 0) return "header";

    const itemTime = new Date(itemTimestamp).getTime();

    // If it's an assistant message, we prefer the most recent user message that preceded it
    if (isAssistantMessage) {
      let bestUserMsg = null;
      let minDiff = Infinity;
      for (const u of userMessages) {
        const uTime = new Date(u.timestamp).getTime();
        const diff = itemTime - uTime;
        // u must precede or be extremely close (to handle minor clock skews where assistant is slightly ahead but practically same time)
        if (diff >= -10000 && diff < minDiff) {
          minDiff = diff;
          bestUserMsg = u;
        }
      }
      if (bestUserMsg) return bestUserMsg.id;
      return "header";
    }

    // For tasks, they are ALWAYS associated with a user message (never header).
    // Find the user message closest to the task's createdAt, preferring preceding ones
    // and allowing up to 5 minutes of clock skew where the server-side task creation is slightly ahead.
    let bestUserMsg = userMessages[0];
    let bestDiff = Infinity;

    for (const u of userMessages) {
      const uTime = new Date(u.timestamp).getTime();
      const diff = itemTime - uTime;
      if (diff >= -300000) {
        if (diff < bestDiff) {
          bestDiff = diff;
          bestUserMsg = u;
        }
      }
    }

    return bestUserMsg.id;
  };

  // Create groups
  const groups: Record<string, {
    userMessage?: typeof messages[0];
    tasks: typeof tasks;
    messages: typeof messages;
  }> = {
    "header": { tasks: [], messages: [] }
  };

  // Initialize group for each user message
  for (const u of userMessages) {
    groups[u.id] = {
      userMessage: u,
      tasks: [],
      messages: []
    };
  }

  // Distribute other messages
  for (const m of messages) {
    if (m.role === "user") continue;
    const assocId = getAssociatedUserMessageId(m.timestamp, true);
    groups[assocId].messages.push(m);
  }

  // Distribute tasks (filtering at the timeline construction stage to achieve sequential task disclosure!)
  for (const t of tasks) {
    const assocId = getAssociatedUserMessageId(t.createdAt, false);
    if (!groups[assocId]) {
      groups["header"].tasks.push(t);
    } else {
      groups[assocId].tasks.push(t);
    }
  }

  // Construct the final sorted timeline list
  const timeline: Array<
    | { type: "message"; id: string; timestamp: string; data: typeof messages[0] }
    | { type: "task"; id: string; timestamp: string; data: typeof tasks[0] }
  > = [];

  // 1. Add header group items (e.g. Welcome Message)
  groups["header"].messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  for (const m of groups["header"].messages) {
    timeline.push({ type: "message", id: m.id, timestamp: m.timestamp, data: m });
  }
  
  groups["header"].tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const visibleHeaderTasks = groups["header"].tasks.filter((t, tIdx) => tIdx === 0 || t.status !== "pending");
  for (const t of visibleHeaderTasks) {
    timeline.push({ type: "task", id: t.id, timestamp: t.createdAt, data: t });
  }

  // 2. Add other user message groups sorted by the user message's timestamp
  const sortedUserMessages = [...userMessages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (const u of sortedUserMessages) {
    const grp = groups[u.id];
    // A. Add the user message itself
    timeline.push({ type: "message", id: u.id, timestamp: u.timestamp, data: u });

    // B. Add associated tasks, sorted by createdAt
    grp.tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    // We only show tasks that are not pending, EXCEPT for the very first task in the group,
    // which is always shown so the user knows the build plan has started.
    const visibleGrpTasks = grp.tasks.filter((t, tIdx) => tIdx === 0 || t.status !== "pending");
    for (const t of visibleGrpTasks) {
      timeline.push({ type: "task", id: t.id, timestamp: t.createdAt, data: t });
    }

    // C. Add associated assistant/system messages, sorted by timestamp
    grp.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (const m of grp.messages) {
      timeline.push({ type: "message", id: m.id, timestamp: m.timestamp, data: m });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none overflow-x-hidden antialiased">
      
      {/* Top Banner Bar - matching screenshot exactly! */}
      <header className="bg-white border-b border-gray-100 px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs gap-2">
        
        {/* Left Side: Brand badge */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button 
            id="btn-sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-500 text-white font-bold text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-full shadow-xs whitespace-nowrap select-none shrink-0 cursor-pointer hover:bg-amber-400 transition-colors">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white shrink-0" />
              <span className="hidden sm:inline-block">Sovereign Agent</span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
            </div>
          </div>
        </div>

        {/* Center: Tabs Bar - styled exactly like the design screenshot! */}
        <div className="flex items-center bg-gray-100 p-0.5 sm:p-1 rounded-full border border-gray-150 relative shrink-0">
          <button
            id="tab-btn-chat"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === "chat" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Chat</span>
          </button>
          
          <button
            id="tab-btn-preview"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === "preview" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Smartphone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Preview</span>
          </button>

          {/* More Dropdown Tab */}
          <div className="relative shrink-0">
            <button
              id="tab-btn-more"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                !["chat", "preview"].includes(activeTab) ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span>More</span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>

            {/* Dropdown Options List */}
            <AnimatePresence>
              {isMoreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 z-50 overflow-hidden font-sans text-xs"
                  >
                    {[
                      { id: "simulation", name: "Sub-Tasks Simulator", icon: Cpu, color: "text-pink-500 animate-pulse" },
                      { id: "code", name: "Code", icon: Code, color: "text-blue-500" },
                      { id: "deploy", name: "Deploy", icon: Zap, color: "text-amber-500" },
                      { id: "logs", name: "Logs", icon: FileText, color: "text-gray-500" },
                      { id: "github", name: "GitHub", icon: Github, color: "text-neutral-800" },
                      { id: "permissions", name: "Permissions", icon: ShieldCheck, color: "text-emerald-500" },
                      { id: "settings", name: "Settings", icon: Settings, color: "text-gray-600" },
                      { id: "supabase", name: "Supabase", icon: Zap, color: "text-emerald-600" },
                      { id: "notifications", name: "Notifications", icon: Bell, color: "text-red-500" },
                      { id: "screenshots", name: "Screenshots", icon: Camera, color: "text-indigo-500" }
                    ].map(item => (
                      <button
                        id={`more-menu-item-${item.id}`}
                        key={item.id}
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          setActiveTab(item.id as any);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 rounded-xl text-left text-xs font-medium text-gray-700 transition-colors"
                      >
                        <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
                        {item.name}
                      </button>
                    ))}
                    
                    <div className="border-t border-gray-100 my-1" />
                    
                    <button
                      id="more-menu-item-duplicate"
                      onClick={() => { alert("Duplicating project blueprint in background..."); setIsMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 rounded-xl text-left text-xs font-medium text-gray-500 transition-colors"
                    >
                      <Copy className="h-4.5 w-4.5" />
                      Duplicate Project
                    </button>
                    <button
                      id="more-menu-item-download"
                      onClick={() => { alert("Zipping project directory to download.zip..."); setIsMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 rounded-xl text-left text-xs font-medium text-gray-500 transition-colors"
                    >
                      <Download className="h-4.5 w-4.5" />
                      Download ZIP
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty spacer element to balance flex justify-between layout if needed, or simply let flex-between space left/center */}
        <div className="w-10 sm:w-12 md:hidden block"></div>
      </header>

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col min-h-0 relative">
        <AnimatePresence mode="wait">
          
          {/* 1. CHAT WORKSPACE VIEW */}
          {activeTab === "chat" && (
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* If no user commands yet, show pristine central Welcome greeting exactly matching screenshot! */}
              {tasks.length === 0 && messages.filter(m => m.id !== "welcome-msg").length === 0 ? (
                <div id="central-welcome-greeting" className="flex-grow flex flex-col items-center justify-center text-center py-10 max-w-2xl mx-auto space-y-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="space-y-4"
                  >
                    <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-gray-900 font-display">
                      Welcome back.
                    </h1>
                    <p className="text-2xl sm:text-3xl text-gray-400 font-light font-sans leading-relaxed">
                      Systems are ready for your
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display tracking-tight">
                      Trinity Universe build.
                    </h2>
                  </motion.div>

                  {/* Centered Input Form for Welcome state */}
                  <div className="w-full shrink-0 z-30">
                    <form 
                      onSubmit={handleSendPrompt}
                      className="bg-white rounded-full px-5 py-3.5 shadow-md hover:shadow-lg transition-shadow border border-gray-150 flex items-center gap-3"
                    >
                      <button 
                        id="btn-input-plus"
                        type="button" 
                        onClick={() => { alert("Uploading file/attachment triggers coming soon in workspace..."); }}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>

                      <input
                        id="input-prompt-command"
                        type="text"
                        placeholder="Command the Titan-Lobe..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                        disabled={isSending}
                      />

                      <button
                        id="btn-input-submit"
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="p-3 bg-black text-white hover:bg-zinc-800 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-black select-none shrink-0"
                      >
                        {isSending ? <Loader2 className="h-4.5 w-4.5 animate-spin text-white" /> : <Send className="h-4.5 w-4.5 text-white" />}
                      </button>
                    </form>

                    {/* Suggestions list */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {[
                        "setup email registration with auth-guards",
                        "generate custom chart dashboards widget",
                        "seed database with 50 test products logs"
                      ].map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setInputText(sug)}
                          className="text-[11px] bg-white border border-gray-200 text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-full transition-colors font-mono cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Else, render the unified chronological chat and task feed! */
                <div id="chat-thread-container" className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full relative pb-4">
                  {/* Stream Feed Header info */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-150/70 shrink-0">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                      <span className="text-xs font-bold text-gray-700 font-mono uppercase tracking-wider">Workspace Execution Timeline</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        SSE PIPELINE {isConnectedSSE ? "ONLINE" : "OFFLINE"}
                      </span>
                      <button 
                        id="btn-clear-chat"
                        onClick={handleClearSession}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                        title="Purge session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* 1. GLOBAL BLUEPRINT: MASTER TASK PLANS LIST (Phase 1) */}
                  {tasks.length > 0 && (
                    <div id="global-blueprint-master-plans" className="bg-slate-50/70 border border-slate-150/80 rounded-2xl p-4 mb-4 shrink-0 shadow-3xs max-w-4xl w-full">
                      <div className="flex items-center gap-2 mb-2.5 pb-1.5 border-b border-slate-150/50">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
                          📋 Global Blueprint: Master Task Itinerary Plan
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {tasks.map((task, tIdx) => {
                          const isLocked = tasks.slice(0, tIdx).some(prevTask => prevTask.status !== "completed");
                          const statusColor = task.status === "completed" ? "text-emerald-600 bg-emerald-50/70 border-emerald-150/60" : 
                                              task.status === "running" ? "text-blue-600 bg-blue-50/70 border-blue-150/60 animate-pulse" : 
                                              task.status === "awaiting_approval" ? "text-amber-600 bg-amber-50/70 border-amber-150/60 animate-pulse" :
                                              "text-slate-400 bg-slate-50/50 border-slate-150/40";
                          const statusIcon = task.status === "completed" ? "🟢" : 
                                             task.status === "running" ? "🔵" : 
                                             task.status === "awaiting_approval" ? "🟡" : "⏳";
                          const statusText = task.status === "completed" ? "Completed" : 
                                             task.status === "running" ? "Running" : 
                                             task.status === "awaiting_approval" ? "Needs Approval" :
                                             isLocked ? "Locked" : "Pending";
                          return (
                            <div key={task.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl border border-slate-150/50 bg-white/60 shadow-3xs">
                              <span className="font-semibold text-slate-700 truncate mr-2">
                                Task {tIdx + 1}: {task.name}
                              </span>
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusColor} flex items-center gap-1`}>
                                <span>{statusIcon}</span>
                                <span>{statusText}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 1b. APPROVAL GATE: Simple request pulled in extra backend/setup work */}
                  {tasks.some(t => t.requiresApproval && t.status === "awaiting_approval") && (() => {
                    const gatedTask = tasks.find(t => t.requiresApproval && t.status === "awaiting_approval")!;
                    return (
                      <div id="approval-gate-card" className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-4 shrink-0 shadow-3xs max-w-4xl w-full">
                        <div className="flex items-start gap-3">
                          <span className="text-lg shrink-0">🟡</span>
                          <div className="flex-1 space-y-2">
                            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono">
                              Approval Needed Before Continuing
                            </h4>
                            <p className="text-xs text-amber-900 leading-relaxed">
                              {gatedTask.approvalReason || "This plan includes extra setup work beyond your request. Approve to continue, or decline to keep it simple."}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                id="btn-approve-plan"
                                onClick={() => handleApprovalDecision(gatedTask.buildId!, true)}
                                className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors cursor-pointer"
                              >
                                ✓ Approve & Continue
                              </button>
                              <button
                                id="btn-reject-plan"
                                onClick={() => handleApprovalDecision(gatedTask.buildId!, false)}
                                className="text-xs font-semibold bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                              >
                                ✕ Keep It Simple
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Unified Feed Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 scrollbar-thin pb-4">
                    {timeline.map((item, index) => {
                      if (item.type === "message") {
                        const msg = item.data;
                        if (msg.role === "user") {
                          return (
                            <div key={item.id} className="flex flex-col items-end w-full">
                              <div className="bg-[#e3edfa] text-slate-800 rounded-3xl rounded-tr-none px-6 py-4 max-w-[85%] shadow-xs leading-relaxed text-sm">
                                {msg.content}
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1.5 px-2 font-mono">
                                User • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        } else if (msg.role === "system") {
                          return (
                            <div key={item.id} className="w-full flex justify-center">
                              <div className="bg-amber-50 text-amber-800 border border-amber-100 rounded-2xl px-5 py-3 text-xs font-mono max-w-[90%] shadow-xs">
                                {msg.content}
                              </div>
                            </div>
                          );
                        } else {
                          // Assistant / Agent Message
                          return (
                            <div key={item.id} className="flex gap-4 items-start w-full">
                              <div className="h-9 w-9 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Cpu className="h-5 w-5" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="text-gray-800 leading-relaxed text-sm p-4 bg-white border border-gray-150 rounded-2xl">
                                  {msg.content}
                                </div>
                                <span className="text-[9px] font-mono text-gray-400">
                                  Agent • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        }
                      } else {
                        // Task Item
                        const task = item.data;
                        const taskIndex = tasks.findIndex(t => t.id === task.id) + 1;
                        
                        // Progressive / Just-in-Time Layout:
                        // A task should only be rendered on the screen if it is the first task, 
                        // or if the predecessor task has completed.
                        const isPredecessorCompleted = taskIndex === 1 || (tasks[taskIndex - 2] && tasks[taskIndex - 2].status === "completed");
                        
                        if (!isPredecessorCompleted) {
                          // Crucial constraint: Task 3, Task 4, and future line headers do not exist on the screen yet!
                          return null;
                        }

                        const isLocked = tasks.slice(0, taskIndex - 1).some(prevTask => prevTask.status !== "completed");
                        const isCompleted = task.status === "completed";
                        const isRunning = task.status === "running";
                        const isFailed = task.status === "failed";
                        const isAwaitingApproval = task.status === "awaiting_approval";

                        return (
                          <div key={item.id} className="w-full space-y-4">
                            {/* Phase 3: Transition Text (The Handshake) */}
                            {taskIndex > 1 && tasks[taskIndex - 2]?.status === "completed" && (
                              <div className="flex gap-4 items-start w-full animate-fade-in py-1">
                                <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                                  <Cpu className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="text-indigo-900 leading-relaxed text-xs p-3.5 bg-indigo-50/75 border border-indigo-150 rounded-2xl font-mono font-medium max-w-2xl">
                                    ⚡ Transitioning task flow. Predecessor task completed successfully.
                                    <br />
                                    <span className="text-indigo-600 font-bold">Now let us begin Task {taskIndex}: {task.name}...</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Main Task Layout Block */}
                            <div className={`w-full pl-0 sm:pl-13 space-y-3.5 transition-all duration-300 ${isLocked ? "opacity-55" : ""}`}>
                              {/* Phase 2: Static Line Header - Permanent Layout Anchor */}
                              <div className="flex items-center gap-3 select-none">
                                <div className={`h-2.5 w-2.5 rounded-full ${
                                  isCompleted ? "bg-emerald-500 shadow-emerald-200 shadow-sm" :
                                  isRunning ? "bg-blue-500 animate-pulse shadow-blue-200 shadow-sm" :
                                  isFailed ? "bg-rose-500 shadow-rose-200 shadow-sm" :
                                  isAwaitingApproval ? "bg-amber-400 animate-pulse shadow-amber-200 shadow-sm" : "bg-gray-300"
                                }`} />
                                <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                                  isCompleted ? "text-emerald-600" :
                                  isRunning ? "text-blue-600" :
                                  isFailed ? "text-rose-600" :
                                  isAwaitingApproval ? "text-amber-600" : "text-slate-400"
                                }`}>
                                  {isCompleted ? "🟢 SUCCESS" : isRunning ? "🔵 ACTIVE" : isFailed ? "🔴 FAILED" : isAwaitingApproval ? "🟡 AWAITING APPROVAL" : "⏳ LOCKED"}
                                </span>
                                <span className="text-xs text-slate-200">|</span>
                                <h3 className={`text-xs font-bold font-mono tracking-tight uppercase ${isLocked ? "text-slate-400" : "text-slate-700"}`}>
                                  {isCompleted ? `Completed Task ${taskIndex}: ${task.name}` :
                                   isRunning ? `Executing Task ${taskIndex}: ${task.name}` :
                                   isFailed ? `Failed Task ${taskIndex}: ${task.name}` :
                                   isAwaitingApproval ? `Task ${taskIndex}: ${task.name} (paused)` :
                                   `Task ${taskIndex}: ${task.name}`}
                                </h3>
                                {isLocked && !isAwaitingApproval && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                    Locked
                                  </span>
                                )}
                              </div>

                              {/* Phase 3 & 4: Unified Accordion Card (hidden until the plan is approved / execution has actually started) */}
                              {!isAwaitingApproval && (
                                <div className={isLocked ? "pointer-events-none select-none" : ""}>
                                  <TaskAccordion 
                                    task={task} 
                                    isInitiallyExpanded={index === timeline.length - 1 || isRunning} 
                                    isLocked={isLocked}
                                    taskIndex={taskIndex}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Fixed bottom Input Bar */}
                  <div className="w-full bg-slate-50/90 pt-3 pb-1 border-t border-gray-150/50 z-30 shrink-0">
                    <form 
                      onSubmit={handleSendPrompt}
                      className="bg-white rounded-full px-5 py-3.5 shadow-md hover:shadow-lg transition-shadow border border-gray-150 flex items-center gap-3"
                    >
                      <button 
                        id="btn-input-plus"
                        type="button" 
                        onClick={() => { alert("Uploading file/attachment triggers coming soon in workspace..."); }}
                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      <input
                        id="input-prompt-command"
                        type="text"
                        placeholder="Command the Titan-Lobe..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                        disabled={isSending}
                      />
                      <button
                        id="btn-input-submit"
                        type="submit"
                        disabled={!inputText.trim() || isSending}
                        className="p-3 bg-black text-white hover:bg-zinc-800 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-black select-none shrink-0"
                      >
                        {isSending ? <Loader2 className="h-4.5 w-4.5 animate-spin text-white" /> : <Send className="h-4.5 w-4.5 text-white" />}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 13. SUBTASKS SIMULATION VIEW */}
          {activeTab === "simulation" && (
            <motion.div
              key="simulation-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <SubtasksSimulationView />
            </motion.div>
          )}

          {/* 2. PREVIEW TAB VIEW */}
          {activeTab === "preview" && (
            <motion.div
              key="preview-panel"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <PreviewView currentPrompt={currentPrompt} files={files} previewReloadKey={previewReloadKey} />
            </motion.div>
          )}

          {/* 3. CODE TAB VIEW */}
          {activeTab === "code" && (
            <motion.div
              key="code-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <CodeView files={files} onUpdateFile={handleUpdateFile} />
            </motion.div>
          )}

          {/* 4. DATABASE TAB VIEW */}
          {activeTab === "database" && (
            <motion.div
              key="database-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <DbVisualizer messages={messages} tasks={tasks} files={files} onPurge={handleClearSession} />
            </motion.div>
          )}

          {/* 5. LOGS VIEW */}
          {activeTab === "logs" && (
            <motion.div
              key="logs-panel"
              className="flex-1 flex flex-col min-h-0 border border-gray-100 rounded-3xl bg-gray-950 p-5 font-mono text-xs text-gray-300"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4 text-gray-500">
                <span>TERMINAL SERVICE CONSOLE</span>
                <span className="text-emerald-500">LIVESTREAM</span>
              </div>
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                <div>[SYSTEM] Container spin-up active. Port 3000 mapped.</div>
                <div>[SYSTEM] PostgreSQL relational status: {dbStatus.postgres}</div>
                <div>[SYSTEM] Redis caching pool status: {dbStatus.redis}</div>
                <div>[HTTP] Listening for SSE handshakes at /api/tasks/stream</div>
                {files.map(f => (
                  <div key={f.path} className="text-emerald-400">[FILESYSTEM] Synced synthesized artifact: {f.path}</div>
                ))}
                {tasks.map(t => (
                  <div key={t.id} className="text-amber-500">[COMPILER] Active pipeline registration: "{t.name}"</div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 6. DEPLOY VIEW */}
          {activeTab === "deploy" && (
            <motion.div
              key="deploy-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <DeployView />
            </motion.div>
          )}

          {/* 7. GITHUB SYNC VIEW */}
          {activeTab === "github" && (
            <motion.div
              key="github-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <GithubView />
            </motion.div>
          )}

          {/* 8. PERMISSIONS CONTROLLER VIEW */}
          {activeTab === "permissions" && (
            <motion.div
              key="permissions-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <PermissionsView />
            </motion.div>
          )}

          {/* 9. SETTINGS TAB VIEW */}
          {activeTab === "settings" && (
            <motion.div
              key="settings-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <SettingsView dbStatus={dbStatus} onRefresh={fetchInitialData} />
            </motion.div>
          )}

          {/* 10. SUPABASE DATABASE INSPECTOR VIEW */}
          {activeTab === "supabase" && (
            <motion.div
              key="supabase-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <SupabaseView />
            </motion.div>
          )}

          {/* 11. ALERTS & NOTIFICATIONS VIEW */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <NotificationsView />
            </motion.div>
          )}

          {/* 12. VIEWPORT SCREENSHOTS GALLERY VIEW */}
          {activeTab === "screenshots" && (
            <motion.div
              key="screenshots-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ScreenshotsView />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Settings configuration Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)} 
          dbStatus={dbStatus} 
          onRefresh={fetchInitialData}
        />
      )}

      {/* Left Sidebar slideout drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-40" onClick={() => setIsSidebarOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-100 shadow-2xl z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                <span className="font-bold text-gray-900 font-display">System Clusters</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-900 text-sm">✕</button>
              </div>

              <div className="flex-1 py-6 space-y-6 overflow-y-auto scrollbar-thin">
                {/* Start Fresh Chat Action */}
                <button
                  id="btn-sidebar-new-chat"
                  onClick={handleStartFreshChat}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-xs transition-all cursor-pointer font-sans shrink-0"
                >
                  <Plus className="h-4 w-4 text-white" />
                  <span>Start Fresh Chat</span>
                </button>

                {/* Chat History Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span>Chat History</span>
                    <span className="text-[10px] bg-gray-150 text-gray-600 px-1.5 py-0.5 rounded-full font-bold font-mono">
                      {savedSessions.length}
                    </span>
                  </h4>

                  {savedSessions.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-dashed border-gray-200 text-center text-[11px] text-gray-400 font-sans">
                      No saved chat sessions yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin pr-1">
                      {savedSessions.map((session) => {
                        const isActive = session.id === activeSessionId;
                        return (
                          <div
                            key={session.id}
                            id={`session-item-${session.id}`}
                            onClick={() => handleLoadSession(session)}
                            className={`group relative flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isActive
                                ? "bg-amber-50/70 border-amber-200 text-amber-900 shadow-xs font-semibold"
                                : "bg-gray-50/50 hover:bg-gray-100/70 border-gray-150 text-gray-700 hover:text-gray-900"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? "text-amber-500" : "text-gray-400 group-hover:text-gray-600"
                              }`} />
                              <div className="min-w-0 flex-1 font-sans">
                                <p className="text-xs truncate font-semibold">
                                  {session.title || "Workspace Session"}
                                </p>
                                <p className="text-[9px] text-gray-400 font-mono mt-0.5">
                                  {new Date(session.lastUpdated).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Delete action button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSession(session.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200/60 hover:text-red-500 rounded-md transition-all text-gray-400 shrink-0 ml-1.5"
                              title="Delete Session"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Current Build</h4>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium font-mono">LOCAL TIME</p>
                      <p className="text-sm font-bold text-gray-800">{currentTime || "00:00 AM"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Connections</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-600 p-2 border-b border-gray-50">
                      <span>PostgreSQL</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${dbStatus.postgres === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {dbStatus.postgres}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium text-gray-600 p-2">
                      <span>Redis Cache</span>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${dbStatus.redis === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {dbStatus.redis}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-4 flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  C
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Workspace</p>
                  <p className="text-[10px] text-gray-400">trinityceo717@gmail.com</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
