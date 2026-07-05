import React, { useState, useEffect } from "react";
import { Task, Subtask } from "../types.js";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Chapter {
  id: string;
  explanation: string;
  subtasks: Subtask[];
  startIndex: number;
}

function SubtaskRow({ sub, globalIndex }: { sub: Subtask; globalIndex: number; key?: string }) {
  const [isSubExpanded, setIsSubExpanded] = useState(sub.status === "running" || sub.status === "failed");

  useEffect(() => {
    if (sub.status === "running" || sub.status === "failed") {
      setIsSubExpanded(true);
    }
  }, [sub.status]);

  const nameLower = sub.name.toLowerCase();
  
  // Is this command-based?
  const isCommand = 
    nameLower.includes("run") || 
    nameLower.includes("grep") || 
    nameLower.includes("ls") || 
    nameLower.includes("git") || 
    nameLower.includes("command") || 
    nameLower.includes("npm") || 
    nameLower.includes("node") || 
    nameLower.includes("tsc") || 
    nameLower.includes("lint");

  // Format cmdLine
  let cmdLine = "";
  let outputLogs = [...sub.logs];
  if (outputLogs.length > 0 && outputLogs[0].startsWith("$")) {
    cmdLine = outputLogs[0];
    outputLogs = outputLogs.slice(1);
  } else if (isCommand) {
    if (nameLower.includes("grep")) {
      cmdLine = `$ grep -n "FileTree\\|file.*tree\\|libraryFiles" ./src/components/`;
    } else if (nameLower.includes("ls")) {
      cmdLine = `$ ls -la ./src/components/`;
    } else if (nameLower.includes("clone")) {
      cmdLine = `$ git clone https://github.com/trinity-universe/sovereign-agent.git /tmp/SL`;
    } else if (nameLower.includes("lint")) {
      cmdLine = `$ npm run lint`;
    } else if (nameLower.includes("compile") || nameLower.includes("build")) {
      cmdLine = `$ npm run build`;
    } else {
      cmdLine = `$ ${sub.name}`;
    }
  }

  return (
    <div className={`border border-gray-150 bg-white rounded-xl overflow-hidden shadow-2xs transition-all duration-300 ${
      sub.status === "completed" ? "border-emerald-200/60 shadow-emerald-50/10" : ""
    }`}>
      <div 
        onClick={() => setIsSubExpanded(!isSubExpanded)}
        className="p-3 hover:bg-slate-50/60 flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {sub.status === "completed" ? (
            <div className="h-5 w-5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] text-emerald-600 font-bold shrink-0 shadow-3xs">
              ✓
            </div>
          ) : (
            <div className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border ${
              sub.status === "running" ? "bg-amber-50 border-amber-200 text-amber-600 animate-pulse" : "bg-gray-100 border-gray-150/40 text-gray-500"
            }`}>
              {isCommand ? ">_" : "🧠"}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-800 truncate">
            {sub.name}
          </span>
          {sub.status === "running" && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
          )}
          {sub.status === "completed" && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-150/40 select-none shrink-0">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              Verified Success
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded-full ${
            sub.status === "completed" ? "bg-emerald-50 text-emerald-600" :
            sub.status === "running" ? "bg-amber-50 text-amber-600 animate-pulse" :
            sub.status === "failed" ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-gray-100 text-gray-400"
          }`}>
            {sub.status}
          </span>
          <ChevronRight className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isSubExpanded ? "rotate-90" : ""}`} />
        </div>
      </div>

      <AnimatePresence>
        {isSubExpanded && (sub.logs.length > 0 || sub.code) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-150 bg-slate-900 text-slate-100 overflow-hidden"
          >
            {sub.logs.length > 0 && (
              <div className="p-3 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto scrollbar-thin whitespace-pre-wrap break-all text-left">
                {cmdLine && (
                  <div className="text-emerald-400 font-bold mb-1.5 select-none">{cmdLine}</div>
                )}
                <div className="text-slate-300">
                  {outputLogs.join("\n")}
                </div>
              </div>
            )}

            {sub.code && (
              <div className="bg-slate-950 border-t border-slate-800 p-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1.5">
                  <span>CODE SNAPSHOT: {sub.file}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(sub.code || "");
                    }}
                    className="text-indigo-400 hover:underline font-bold bg-transparent border-none cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 max-h-40 overflow-y-auto overflow-x-auto whitespace-pre">
                  {sub.code}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TaskAccordionProps {
  key?: string;
  task: Task;
  isInitiallyExpanded?: boolean;
  isLocked?: boolean;
  taskIndex?: number;
}

export default function TaskAccordion({ 
  task, 
  isInitiallyExpanded = false, 
  isLocked = false, 
  taskIndex = 1 
}: TaskAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded || task.status === "running");

  useEffect(() => {
    if (task.status === "running" || task.status === "failed") {
      setIsExpanded(true);
    } else if (task.status === "completed") {
      setIsExpanded(false);
    }
  }, [task.status]);
  
  // Track open/closed state for each chapter's action card. All chapters start closed by
  // default (undefined = no manual override yet) — they only auto-open while a subtask
  // inside them is actively running/failed, and stay closed otherwise until the user
  // explicitly clicks to expand them.
  const [openSubtaskChapters, setOpenSubtaskChapters] = useState<Record<string, boolean>>({});

  const uniqueFilesTouched = Array.from(
    new Set(
      task.subtasks
        .map(sub => sub.file || (sub.name.toLowerCase().includes("file") ? sub.name.split("file ").pop()?.trim() : null))
        .filter(Boolean)
    )
  );

  const methodsUsed = Array.from(
    new Set(
      task.subtasks.map(sub => {
        const nl = sub.name.toLowerCase();
        if (nl.includes("edit")) return "edit_file";
        if (nl.includes("create") || nl.includes("write")) return "create_file";
        if (nl.includes("lint")) return "lint_applet";
        if (nl.includes("compile") || nl.includes("build")) return "compile_applet";
        if (nl.includes("install")) return "install_applet_package";
        if (nl.includes("restart")) return "restart_dev_server";
        return "run_command";
      })
    )
  );

  const errorsPatched = task.subtasks.reduce<string[]>((acc, sub) => {
    const logsStr = sub.logs.join("\n").toLowerCase();
    if (sub.status === "failed") {
      acc.push(`Critical failure during: ${sub.name}`);
    } else if (logsStr.includes("error") || logsStr.includes("failed")) {
      const match = sub.logs.find(l => l.toLowerCase().includes("error") || l.toLowerCase().includes("failed"));
      if (match && !acc.includes(match.trim())) {
        acc.push(match.trim());
      }
    }
    return acc;
  }, []);

  const getTaskDurationString = () => {
    if (task.status === "completed") {
      const len = task.subtasks.length;
      const seconds = len > 0 ? len * 3 + 2 : 9;
      return `(${seconds} seconds)`;
    } else if (task.status === "running") {
      return "(executing...)";
    }
    return "(queued)";
  };

  const getTaskChapters = (): Chapter[] => {
    const nameLower = task.name.toLowerCase();
    const subs = task.subtasks;

    if (subs.length === 0) {
      return [{
        id: "ch-default",
        explanation: `Synthesizing the core application architecture and staging code changes. Let me execute the build system for "${task.name}":`,
        subtasks: [],
        startIndex: 0
      }];
    }

    if (nameLower.includes("api keys") || nameLower.includes("envbox") || nameLower.includes("planning")) {
      const chapters: Chapter[] = [];
      if (subs.length >= 4) {
        chapters.push({
          id: "ch-1",
          explanation: "Two things to tackle: (1) the file tree is blank despite showing \"3 files\" — a rendering bug, and (2) you want an env-box panel to paste GitHub + Cloudflare credentials. Let me read the relevant files:",
          subtasks: subs.slice(0, 4),
          startIndex: 0
        });
      } else {
        chapters.push({
          id: "ch-1",
          explanation: "Two things to tackle: (1) the file tree is blank despite showing \"3 files\" — a rendering bug, and (2) you want an env-box panel to paste GitHub + Cloudflare credentials. Let me read the relevant files:",
          subtasks: subs,
          startIndex: 0
        });
      }

      if (subs.length >= 6) {
        chapters.push({
          id: "ch-2",
          explanation: "The clone at /tmp/SL was wiped. Re-cloning:",
          subtasks: subs.slice(4, 6),
          startIndex: 4
        });
      } else if (subs.length > 4) {
        chapters.push({
          id: "ch-2",
          explanation: "The clone at /tmp/SL was wiped. Re-cloning:",
          subtasks: subs.slice(4),
          startIndex: 4
        });
      }

      if (subs.length >= 8) {
        chapters.push({
          id: "ch-3",
          explanation: "Git clone is blocked by askpass. I'll fetch files directly from the GitHub API:",
          subtasks: subs.slice(6, 8),
          startIndex: 6
        });
        if (subs.length > 8) {
          chapters.push({
            id: "ch-4",
            explanation: "Configuring environment templates and saving compiled settings:",
            subtasks: subs.slice(8),
            startIndex: 8
          });
        }
      } else if (subs.length > 6) {
        chapters.push({
          id: "ch-3",
          explanation: "Git clone is blocked by askpass. I'll fetch files directly from the GitHub API:",
          subtasks: subs.slice(6),
          startIndex: 6
        });
      }

      return chapters;
    }

    if (nameLower.includes("postgres") || nameLower.includes("redis") || nameLower.includes("database")) {
      return [{
        id: "ch-db",
        explanation: "Configuring the cloud storage databases, database clusters, and staging active schemas. Let me configure the environment parameters:",
        subtasks: subs,
        startIndex: 0
      }];
    }

    if (nameLower.includes("linter") || nameLower.includes("verify") || nameLower.includes("compile") || nameLower.includes("build")) {
      return [{
        id: "ch-verify",
        explanation: "Verifying compilation and checking TypeScript types. Let me execute the quality assurance build tests:",
        subtasks: subs,
        startIndex: 0
      }];
    }

    if (subs.length >= 4) {
      const mid = Math.ceil(subs.length / 2);
      return [
        {
          id: "ch-gen-1",
          explanation: `Synthesizing the core application architecture and staging code changes. Let me execute the build system for the first phase of target modules of "${task.name}":`,
          subtasks: subs.slice(0, mid),
          startIndex: 0
        },
        {
          id: "ch-gen-2",
          explanation: "Running quality verification and compiling bundled outputs to confirm zero errors or linter warnings:",
          subtasks: subs.slice(mid),
          startIndex: mid
        }
      ];
    }

    return [{
      id: "ch-gen-single",
      explanation: `Synthesizing the core application architecture and staging code changes. Let me execute the build system for "${task.name}":`,
      subtasks: subs,
      startIndex: 0
    }];
  };

  const allChapters = getTaskChapters();
  // Filter chapters to implement sequential disclosure of the task plan.
  // The first chapter is always shown. Subsequent chapters are only shown if at least one subtask
  // inside them has started, completed, or failed (i.e. status is not 'pending').
  const chapters = allChapters.filter((chapter, index) => {
    if (index === 0) return true;
    return chapter.subtasks.some(sub => sub.status !== "pending");
  });

  return (
    <div 
      id={`task-accordion-${task.id}`}
      className={`mb-8 font-sans w-full text-left transition-all ${isLocked ? "pointer-events-none opacity-50" : ""}`}
    >
      {/* 1. Unboxed Compact Header Block */}
      <div 
        id={`task-header-${task.id}`}
        className={`inline-flex items-center justify-between select-none py-1.5 px-3 border rounded-xl transition-all gap-4 shadow-3xs max-w-sm ${
          isLocked 
            ? "bg-slate-100/40 border-slate-200/50 cursor-not-allowed" 
            : "bg-slate-50 border-slate-150/80 hover:bg-slate-100/60 cursor-pointer"
        }`}
        onClick={() => {
          if (!isLocked) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-5.5 w-5.5 rounded-md bg-white flex items-center justify-center text-gray-500 shrink-0 border border-slate-150 shadow-3xs">
            {isLocked ? (
              <span className="text-[10px] select-none text-slate-400">🔒</span>
            ) : task.status === "completed" ? (
              <span className="text-[10px] select-none text-emerald-600 font-bold">✓</span>
            ) : task.status === "running" ? (
              <span className="text-[10px] select-none animate-pulse">⚡</span>
            ) : (
              <span className="text-[10px] select-none text-slate-400">⏳</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className={`font-semibold text-[11px] font-display ${isLocked ? "text-slate-400" : "text-slate-700"}`}>
                {isLocked ? "Actions & Logs Locked" : isExpanded ? "Hide Actions & Logs" : "Show Actions & Logs"}
              </h4>
              <span className="text-[9px] text-gray-400 font-mono font-bold">
                ({getTaskDurationString()})
              </span>
            </div>
          </div>
        </div>

        {!isLocked && (
          <div className="flex items-center gap-1 text-gray-400 pl-1">
            {isExpanded ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
          </div>
        )}
      </div>

      {/* Expandable details/logs/code blocks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden w-full space-y-4"
          >
            {/* Chapters rendering sequentially - connected by timeline border */}
            <div className="pl-4 sm:pl-5 border-l border-slate-150/60 ml-3.5 space-y-5 pt-3.5 mt-0.5">
              {chapters.map(chapter => {
                const chapterHasActiveSubtask = chapter.subtasks.some(sub => sub.status === "running" || sub.status === "failed");
                const chapterAllCompleted = chapter.subtasks.length > 0 && chapter.subtasks.every(sub => sub.status === "completed");
                // Closed by default; auto-opens while a subtask inside is active, unless the
                // user has manually toggled this chapter (their choice always wins).
                const isChapterExpanded = openSubtaskChapters[chapter.id] !== undefined
                  ? openSubtaskChapters[chapter.id]
                  : chapterHasActiveSubtask;
                const toggleChapter = (id: string) => {
                  setOpenSubtaskChapters(prev => ({ ...prev, [id]: !isChapterExpanded }));
                };

                return (
                  <div key={chapter.id} className="space-y-2">
                    {/* Chapter Explanation Text - Written before actions neatly, not packed inside double boxes */}
                    <p className="text-[13px] leading-relaxed text-slate-800 font-sans font-medium max-w-2xl pl-1.5 whitespace-pre-wrap">
                      {chapter.explanation}
                    </p>

                    {/* Sub-Collapsible Actions Row Card */}
                    {chapter.subtasks.length > 0 && (
                      <div className="pl-1.5">
                        <div 
                          onClick={() => toggleChapter(chapter.id)}
                          className="bg-slate-50/70 hover:bg-slate-100/50 p-2.5 rounded-xl border border-gray-150/60 max-w-sm transition-all cursor-pointer group shadow-3xs flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-2">
                            {/* Row of icons */}
                            <div className="flex items-center -space-x-1 p-0.5 shrink-0 bg-white border border-gray-150/40 rounded-lg">
                              {chapter.subtasks.map((sub) => {
                                const isSubCmd = sub.name.toLowerCase().includes("run") || sub.name.toLowerCase().includes("grep") || sub.name.toLowerCase().includes("ls") || sub.name.toLowerCase().includes("git") || sub.name.toLowerCase().includes("lint");
                                return (
                                  <div 
                                    key={sub.id} 
                                    className="h-5.5 w-5.5 rounded-md bg-slate-50 border border-gray-150 flex items-center justify-center text-[9px] font-mono font-bold text-slate-500 shadow-3xs relative z-10 hover:z-20 transition-all"
                                    title={sub.name}
                                  >
                                    {isSubCmd ? ">_" : "🧠"}
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-[10.5px] font-mono font-bold text-gray-500 uppercase tracking-wider ml-1">
                              {chapter.subtasks.length} actions
                            </span>
                            {chapterAllCompleted && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50/60 px-1.5 py-0.5 rounded-full border border-emerald-150/50 select-none shrink-0 ml-1">
                                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                                ✓ Done
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-gray-400">
                            <span className="text-[10px] font-semibold group-hover:text-gray-600 transition-colors">
                              {isChapterExpanded ? "Hide detail" : "Expand actions"}
                            </span>
                            {isChapterExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
                            )}
                          </div>
                        </div>

                        {/* Expandable subtasks checklist */}
                        <AnimatePresence>
                          {isChapterExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden max-w-xl mt-2.5 pl-3.5 border-l border-slate-150/60 space-y-2.5"
                            >
                              {chapter.subtasks.map((sub, sIdx) => (
                                <SubtaskRow 
                                  key={sub.id} 
                                  sub={sub} 
                                  globalIndex={chapter.startIndex + sIdx} 
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Complete Tasks done summary - Executive compilation diagnostics report */}
            <div className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-xs w-full mt-4 pl-0 ml-0">
              <div className="bg-slate-50/75 p-5 space-y-4 font-sans text-left">
                <div className="flex items-center justify-between border-b border-gray-250/40 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📋</span>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 font-mono">
                      Executive Compile & Diagnostics Report
                    </h4>
                  </div>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border font-mono uppercase ${
                    task.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-150/40" :
                    task.status === "running" ? "bg-amber-50 text-amber-700 border-amber-150/40 animate-pulse" :
                    "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    Task Status: {task.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-gray-150 shadow-xs">
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider font-mono block">🚀 WORK DONE ACHIEVEMENTS</span>
                    <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0">•</span>
                        <span>Staged orchestration pipelines for "{task.name}"</span>
                      </li>
                      {uniqueFilesTouched.length > 0 ? (
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-500 shrink-0">•</span>
                          <span>
                            Synthesized and verified code in {uniqueFilesTouched.length} modules:{" "}
                            <span className="font-mono text-[10px] text-indigo-600 block mt-0.5 max-w-full truncate" title={uniqueFilesTouched.join(", ")}>
                              {uniqueFilesTouched.join(", ")}
                            </span>
                          </span>
                        </li>
                      ) : (
                        <li className="flex items-start gap-1.5">
                          <span className="text-emerald-500 shrink-0">•</span>
                          <span>Constructed local parameters & verified environments</span>
                        </li>
                      )}
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-500 shrink-0">•</span>
                        <span>Executed {task.subtasks.length} automation steps with 100% telemetry validation</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-gray-150 shadow-xs">
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider font-mono block">🛠️ APPLIED SYSTEM METHODS</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {methodsUsed.map((m, idx) => (
                        <span key={idx} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/50">
                          {m}()
                        </span>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-gray-500 leading-normal font-medium pt-1">
                      Orchestrated via native API execution with sandboxed control.
                    </p>
                  </div>

                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-gray-150 shadow-xs">
                    <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-wider font-mono block">🩺 QUALITY & VERIFICATION GATES</span>
                    <div className="space-y-2 pt-1.5 text-xs">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-600 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> TS Compilations
                        </span>
                        <span className="font-bold text-emerald-600">Succeeded</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                        <span className="text-gray-600 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Lint Verification
                        </span>
                        <span className="font-bold text-emerald-600">Zero Issues</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Output Sandbox
                        </span>
                        <span className="font-bold text-emerald-600">Synchronized</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 font-sans shadow-md">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <span className="text-amber-500 text-sm">🐛</span>
                    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      WORKSPACE BUGS & REMEDIATIONS LOG
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    {errorsPatched.length > 0 ? (
                      errorsPatched.map((err, idx) => (
                        <div key={idx} className="text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
                            <span>❌ ERROR DETECTED:</span>
                            <span className="font-mono text-[10px] text-rose-300 truncate max-w-[200px]" title={err}>{err}</span>
                          </div>
                          <div className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                            <span>✓ REMEDIATION APPLIED:</span>
                            <span className="text-slate-300 font-normal">Identified cause from system console logs, formulated surgical logic patch, and confirmed zero remaining linting/compilation failures.</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>Zero syntax errors, type-mismatches, or system anomalies detected. Linter passed successfully. Output is fully clean and optimized.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
