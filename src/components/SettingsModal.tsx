import React, { useState, useEffect } from "react";
import { DatabaseStatus } from "../types.js";
import { Database, ShieldCheck, Cpu, Key, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
  dbStatus: DatabaseStatus;
  onRefresh: () => void;
}

export default function SettingsModal({ onClose, dbStatus, onRefresh }: SettingsModalProps) {
  const [postgresUrl, setPostgresUrl] = useState("");
  const [redisUrl, setRedisUrl] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ status: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    // We don't fetch plain secrets to keep them fully secure,
    // but we let the user input and overwrite them.
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveResult(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postgresUrl: postgresUrl || undefined,
          redisUrl: redisUrl || undefined,
          geminiApiKey: geminiApiKey || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSaveResult({ status: "success", message: "Environment credentials saved and reconnected successfully!" });
        onRefresh();
        // Clear inputs after success
        setPostgresUrl("");
        setRedisUrl("");
        setGeminiApiKey("");
      } else {
        setSaveResult({ status: "error", message: data.error || "Failed to update connection secrets." });
      }
    } catch (err: any) {
      setSaveResult({ status: "error", message: err.message || "Network error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const statusBadge = (status: "connected" | "local_fallback" | "error") => {
    switch (status) {
      case "connected":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 font-sans">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Active Cloud Node
        </span>;
      case "local_fallback":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 font-sans">
          <Cpu className="h-3.5 w-3.5 text-amber-600 animate-pulse" /> Sandbox Mode (Durable JSON)
        </span>;
      case "error":
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 font-sans">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Connection Refused
        </span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        id="settings-modal-card"
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-50 bg-linear-to-b from-gray-50/50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-900 rounded-2xl text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 font-display text-lg">Infrastructure Settings</h3>
              <p className="text-xs text-gray-500">Configure PostgreSQL, Redis, & Gemini Credentials</p>
            </div>
          </div>
          <button 
            id="btn-close-settings"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Node Statuses */}
          <div className="space-y-3.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Live Ingress Nodes</h4>
            
            <div className="flex items-center justify-between py-1.5 border-b border-gray-100/60">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-500" />
                PostgreSQL SQL Store
              </span>
              {statusBadge(dbStatus.postgres)}
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-500" />
                Redis Cache Hub
              </span>
              {statusBadge(dbStatus.redis)}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                <Key className="h-3.5 w-3.5 text-gray-400" /> PostgreSQL Connection String
              </label>
              <input
                id="input-postgres-url"
                type="password"
                placeholder="postgresql://user:pass@host:5432/database"
                value={postgresUrl}
                onChange={(e) => setPostgresUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Sovereign Agent connects securely using SSL mode. Empty leaves Sandbox mode active.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-gray-400" /> Redis Cache URL
              </label>
              <input
                id="input-redis-url"
                type="password"
                placeholder="redis://:password@host:port"
                value={redisUrl}
                onChange={(e) => setRedisUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5 font-mono">
                <Cpu className="h-3.5 w-3.5 text-gray-400" /> Gemini API Key
              </label>
              <input
                id="input-gemini-key"
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-mono"
              />
            </div>

            {saveResult && (
              <div id="save-result" className={`p-4 rounded-xl border text-sm flex items-start gap-2.5 animate-in fade-in duration-200 ${
                saveResult.status === "success" 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                <span>{saveResult.status === "success" ? "✓" : "⚠"}</span>
                <div>{saveResult.message}</div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
              <button 
                id="btn-test-settings-connection"
                type="button" 
                onClick={onRefresh}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl flex items-center gap-1.5 transition-all font-mono"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Force Sync
              </button>
              <button
                id="btn-save-settings"
                type="submit"
                disabled={isSaving}
                className="bg-gray-900 text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-gray-850 active:scale-95 disabled:opacity-50 transition-all font-sans"
              >
                {isSaving ? "Connecting..." : "Commit Credentials"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
