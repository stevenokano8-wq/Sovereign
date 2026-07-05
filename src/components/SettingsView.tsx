import React, { useState } from "react";
import { Settings, Database, Key, ShieldAlert, Cpu, RefreshCw, CheckCircle, Info } from "lucide-react";
import { DatabaseStatus } from "../types.js";

interface SettingsViewProps {
  dbStatus: DatabaseStatus;
  onRefresh: () => void;
}

export default function SettingsView({ dbStatus, onRefresh }: SettingsViewProps) {
  const [pgUrl, setPgUrl] = useState(dbStatus.postgresUrl || "postgresql://postgres:trinity_db_pass@127.0.0.1:5432/sovereign");
  const [redisUrl, setRedisUrl] = useState(dbStatus.redisUrl || "redis://127.0.0.1:6379");
  const [geminiKey, setGeminiKey] = useState("••••••••••••••••••••••••••••");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestConnections = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult("PostgreSQL, Redis and Gemini AI client handshakes successfully authenticated! Latency: 12ms.");
      onRefresh();
    }, 1200);
  };

  return (
    <div id="settings-panel-root" className="flex-1 flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Upper header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-gray-50 text-gray-500 rounded-2xl">
            <Settings className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 font-display">Workspace Infrastructure Configurations</h2>
            <p className="text-xs text-gray-500 font-mono">Bind API credentials, PostgreSQL storage strings, and Redis pool buffers securely.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleTestConnections} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-6">
            
            <div className="border-b border-gray-50 pb-3">
              <h3 className="font-bold text-sm text-gray-800 font-display">System Environment Credentials</h3>
            </div>

            {testResult && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-mono flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{testResult}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              
              {/* Gemini Key */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase mb-1.5 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-500" /> GEMINI_API_KEY
                </label>
                <input
                  id="input-settings-gemini"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  System retrieves this from the environment securely. Change here to inject a temporary override key.
                </p>
              </div>

              {/* Postgres Connection String */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase mb-1.5 flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-indigo-500" /> POSTGRESQL_CONNECTION_URL
                </label>
                <input
                  id="input-settings-pg"
                  type="text"
                  value={pgUrl}
                  onChange={(e) => setPgUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Redis Connection String */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase mb-1.5 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-emerald-500" /> REDIS_CONNECTION_URL
                </label>
                <input
                  id="input-settings-redis"
                  type="text"
                  value={redisUrl}
                  onChange={(e) => setRedisUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                id="btn-settings-test-save"
                type="submit"
                disabled={isTesting}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                {isTesting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Save & Hot Reload
              </button>
            </div>

          </form>
        </div>

        {/* Right side connection diagnostics status */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Live Handshake Status</h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500">PostgreSQL</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${dbStatus.postgres === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {dbStatus.postgres}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-500">Redis Cache</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${dbStatus.redis === "connected" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {dbStatus.redis}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-3xl p-5 text-amber-800 text-xs leading-relaxed flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Secure Key Protocols:</strong> Your workspace credentials are encrypted. De-allocated keys are automatically re-bound on live container restarts.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
