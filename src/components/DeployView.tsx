import React, { useState } from "react";
import { Zap, Cloud, Play, CheckCircle, RefreshCw, Cpu, Clock, Terminal, Globe, Shield, ShieldAlert, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function DeployView() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [history, setHistory] = useState([
    { id: "dep-1", version: "v1.0.4", status: "active", url: "https://sovereign-trinity-main.run.app", time: "10 mins ago", commit: "Refactor database client configurations" },
    { id: "dep-2", version: "v1.0.3", status: "superseded", url: "https://sovereign-trinity-103.run.app", time: "2 hours ago", commit: "Implement system logs real-time stream" },
    { id: "dep-3", version: "v1.0.2", status: "superseded", url: "https://sovereign-trinity-102.run.app", time: "1 day ago", commit: "Add space-grotesk typography pairing" }
  ]);

  const steps = [
    "Compiling application assets...",
    "Building container image with Cloud Build...",
    "Uploading container layers to Artifact Registry...",
    "Provisioning secure Cloud Run micro-service...",
    "Activating secure ingress on port 3000...",
    "Health checking live endpoint routing..."
  ];

  const handleStartDeploy = () => {
    setIsDeploying(true);
    setDeployStep(0);
    const interval = setInterval(() => {
      setDeployStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDeploying(false);
            setHistory(prevHistory => [
              {
                id: `dep-${Date.now()}`,
                version: `v1.0.${5 + prevHistory.length}`,
                status: "active",
                url: "https://sovereign-trinity-new.run.app",
                time: "Just now",
                commit: "CEO Triggered production hot-deploy"
              },
              ...prevHistory.map(h => ({ ...h, status: h.status === "active" ? "superseded" : h.status }))
            ]);
          }, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  return (
    <div id="deploy-panel-root" className="flex-1 flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-gray-900 to-zinc-800 text-white rounded-3xl p-6 md:p-8 border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
          <Cloud className="w-96 h-96" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono w-max">
              <Zap className="h-3.5 w-3.5 fill-white" /> Production Environment
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Cloud Run Container Deploy</h2>
            <p className="text-sm text-gray-300 max-w-xl">
              Compile your Sovereign Trinity codebase into an isolated, auto-scaling secure container in our production cluster. Mapped with automatic SSL.
            </p>
          </div>

          <button
            id="btn-deploy-trigger"
            onClick={handleStartDeploy}
            disabled={isDeploying}
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            {isDeploying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Synthesizing Container...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-black text-black" />
                Trigger Production Release
              </>
            )}
          </button>
        </div>

        {isDeploying && (
          <div id="deploy-progress-container" className="mt-8 pt-6 border-t border-gray-800 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-amber-400 font-bold animate-pulse">DEPLOY STATE: IN_PROGRESS</span>
              <span>{Math.round(((deployStep + 1) / steps.length) * 100)}%</span>
            </div>
            
            {/* Real Progress Bar */}
            <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-800">
              <motion.div 
                className="bg-amber-500 h-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((deployStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-200 font-mono">
              <Terminal className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>{steps[deployStep]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Stats and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Stats Rail */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Version details */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Instance Metrics</h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                <span className="text-gray-500 flex items-center gap-2"><Cpu className="h-3.5 w-3.5 text-indigo-500" /> CPU Limits</span>
                <span className="font-bold text-gray-800 font-mono">1.0 vCPU (Auto-scaling)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                <span className="text-gray-500 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-blue-500" /> Build Duration</span>
                <span className="font-bold text-gray-800 font-mono">42.5 seconds</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                <span className="text-gray-500 flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-teal-500" /> Ingress Path</span>
                <span className="font-bold text-emerald-600 font-mono">Port 3000 (HTTPS)</span>
              </div>
              <div className="flex justify-between items-center py-2 text-xs">
                <span className="text-gray-500 flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-emerald-500" /> SSL Status</span>
                <span className="font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 text-[10px]">Active</span>
              </div>
            </div>
          </div>

          {/* Sandbox Warning */}
          <div className="bg-amber-50 border border-amber-200/60 rounded-3xl p-5 text-amber-800 text-xs leading-relaxed flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Production Clusters Policy:</strong> Active code releases bind directly with your sandboxed local workspace database file and re-inject environments securely. Ensure your credentials are locked in Settings before deploying.
            </div>
          </div>
        </div>

        {/* Deployment History Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-800 font-display">Active Deployment Logs</h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full font-mono">{history.length} Revisions</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-gray-600 font-mono">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                  <th className="p-4">revision</th>
                  <th className="p-4">status</th>
                  <th className="p-4">commit summary</th>
                  <th className="p-4">timestamp</th>
                  <th className="p-4">ingress URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/30">
                    <td className="p-4 font-bold text-gray-900">{item.version}</td>
                    <td className="p-4">
                      {item.status === "active" ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max">
                          <CheckCircle className="h-3 w-3 text-emerald-600" /> Active Ingress
                        </span>
                      ) : (
                        <span className="bg-gray-50 text-gray-400 border border-gray-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-max">
                          Superseded
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={item.commit}>{item.commit}</td>
                    <td className="p-4 text-gray-400">{item.time}</td>
                    <td className="p-4">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        Launch ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
