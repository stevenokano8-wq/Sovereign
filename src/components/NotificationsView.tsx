import React, { useState } from "react";
import { Bell, Mail, Clock, ShieldCheck, Play, Plus, RefreshCw, CheckCircle, Trash2, Sliders, AlertTriangle } from "lucide-react";

export default function NotificationsView() {
  const [channels, setChannels] = useState({
    browser: true,
    email: false,
    slack: true
  });

  const [alerts, setAlerts] = useState([
    { id: "alt-1", title: "Cloud Run auto-scaled container", msg: "Allocated 1 fresh container instance to absorb traffic", type: "info", time: "10 mins ago" },
    { id: "alt-2", title: "PostgreSQL Database Backup Successfully Saved", msg: "Automated snapshot triggered by Trinity backup cron", type: "success", time: "1 hour ago" },
    { id: "alt-3", title: "PostgreSQL database client connected", msg: "Ingress connection authenticated from server-side process", type: "success", time: "2 hours ago" },
    { id: "alt-4", title: "Rate limiting thresholds warning", msg: "Anomalous traffic spikes detected on client endpoints", type: "warn", time: "1 day ago" }
  ]);

  const [cronExpression, setCronExpression] = useState("*/5 * * * *");
  const [cronPrompt, setCronPrompt] = useState("Scan container logs and compile alerts");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledJobs, setScheduledJobs] = useState([
    { id: "job-1", cron: "0 * * * *", prompt: "PostgreSQL backup scheduler", status: "active" }
  ]);

  const triggerAlert = () => {
    const fresh = {
      id: `alt-${Date.now()}`,
      title: "Manual workspace diagnostic completed",
      msg: "System health metrics: CPU optimal, Redis operational, SSE stable",
      type: "success",
      time: "Just now"
    };
    setAlerts(prev => [fresh, ...prev]);
  };

  const handleCreateCron = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      setScheduledJobs(prev => [
        {
          id: `job-${Date.now()}`,
          cron: cronExpression,
          prompt: cronPrompt,
          status: "active"
        },
        ...prev
      ]);
      setCronPrompt("");
    }, 800);
  };

  return (
    <div id="notifications-panel-root" className="flex-1 flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Upper stats panel */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl relative">
            <Bell className="h-7 w-7" />
            <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-red-500 text-[9px] text-white font-extrabold flex items-center justify-center rounded-full border-2 border-white animate-pulse">!</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 font-display">System Alert Notifications</h2>
            <p className="text-xs text-gray-500">Configure webhook alert channels, schedule cron checks, and monitor telemetry logs in real time.</p>
          </div>
        </div>

        <button
          id="btn-trigger-alert-diagnostics"
          onClick={triggerAlert}
          className="w-full md:w-auto bg-gray-900 hover:bg-zinc-800 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sliders className="h-4 w-4 text-amber-400" /> Run Workspace Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Toggles and Crons */}
        <div className="space-y-6">
          
          {/* Notification Channels Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Alert Channels</h3>
            
            <div className="space-y-3">
              {Object.keys(channels).map(ch => {
                const isActive = channels[ch as keyof typeof channels];
                return (
                  <button
                    id={`toggle-ch-${ch}`}
                    key={ch}
                    onClick={() => setChannels(prev => ({ ...prev, [ch]: !isActive }))}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-700 capitalize flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-500" /> {ch} Alerts
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-400"}`}>
                      {isActive ? "ENABLED" : "DISABLED"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Dynamic Cron Check */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Create Cron Monitor</h3>
            
            <form onSubmit={handleCreateCron} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase mb-1">Cron Expression</label>
                <input
                  id="input-cron-expr"
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-mono focus:outline-none"
                  placeholder="*/5 * * * *"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 font-mono uppercase mb-1">Monitor Task Label</label>
                <input
                  id="input-cron-prompt"
                  type="text"
                  required
                  value={cronPrompt}
                  onChange={(e) => setCronPrompt(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:outline-none"
                  placeholder="e.g. Check database indices health"
                />
              </div>

              <button
                id="btn-create-cron"
                type="submit"
                disabled={isScheduling}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
              >
                {isScheduling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Register Job
              </button>
            </form>
          </div>
        </div>

        {/* Center/Right columns: Live alerts feed and scheduled tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Job Triggers */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono mb-3">Background Cron Registry</h3>
            <div className="divide-y divide-gray-50 max-h-36 overflow-y-auto">
              {scheduledJobs.map(job => (
                <div key={job.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-indigo-600 mr-2">[{job.cron}]</span>
                    <span className="text-gray-700">{job.prompt}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Alerts Streams */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden flex flex-col flex-1">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800 font-display flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                <span>Live Stream Events</span>
              </h3>
              
              <button
                id="btn-purge-alerts"
                onClick={() => setAlerts([])}
                className="text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1 font-mono"
              >
                <Trash2 className="h-3.5 w-3.5" /> purge logs
              </button>
            </div>

            <div className="divide-y divide-gray-50 max-h-[35vh] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-mono text-xs">
                  All systems operating nominally. Zero warnings or alarms triggered.
                </div>
              ) : (
                alerts.map(alt => (
                  <div key={alt.id} className="p-4 flex items-start gap-3.5 hover:bg-gray-50/20 text-xs">
                    <div className="mt-0.5">
                      {alt.type === "success" && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                      {alt.type === "warn" && <div className="h-2 w-2 rounded-full bg-amber-500" />}
                      {alt.type === "info" && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                    </div>
                    
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-gray-800 truncate">{alt.title}</h4>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0">{alt.time}</span>
                      </div>
                      <p className="text-gray-500 leading-relaxed font-mono text-[11px]">{alt.msg}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
