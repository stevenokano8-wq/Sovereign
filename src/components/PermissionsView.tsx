import React, { useState } from "react";
import { ShieldCheck, Video, Mic, MapPin, Clipboard, FileJson, CheckCircle, Info, Lock } from "lucide-react";

export default function PermissionsView() {
  const [permissions, setPermissions] = useState([
    { id: "camera", name: "Camera Access", desc: "Allow local camera capture for video avatars or screenshots inside the iframe", icon: Video, active: true, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "microphone", name: "Microphone Audio", desc: "Enable server-side and client-side real-time speech compilation", icon: Mic, active: true, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "geolocation", name: "Geolocation Services", desc: "Allow localized context retrieval for search grounding and Maps platforms", icon: MapPin, active: true, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "clipboard", name: "Clipboard Operations", desc: "Permit copy-to-clipboard interactions on text fields automatically", icon: Clipboard, active: false, color: "text-purple-500", bg: "bg-purple-50" }
  ]);

  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  const togglePermission = (id: string) => {
    setPermissions(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const handleSaveMetadata = () => {
    setSavingStatus("Writing configuration state to metadata.json...");
    setTimeout(() => {
      setSavingStatus("Successfully configured metadata.json iframe sandbox.");
      setTimeout(() => setSavingStatus(null), 2500);
    }, 1200);
  };

  return (
    <div id="permissions-panel-root" className="flex-1 flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Intro Header banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-3xl p-6 md:p-8 shadow-md border border-emerald-500 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
          <ShieldCheck className="w-96 h-96" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono w-max">
            <Lock className="h-3 w-3" /> Secure Sandbox Controller
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tight">App Sandbox Permissions</h2>
          <p className="text-sm text-emerald-50 max-w-xl">
            Configure the specific browser framework permissions allowed inside the live preview window frame. Disabling items blocks browser API access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Permissions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-2">
              <h3 className="font-bold text-sm text-gray-800 font-display">Sandbox Privilege Registry</h3>
              <button
                id="btn-save-permissions"
                onClick={handleSaveMetadata}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                Apply Constraints
              </button>
            </div>

            {savingStatus && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-mono flex items-center gap-2">
                <CheckCircle className="h-4 w-4 animate-bounce text-emerald-600" />
                <span>{savingStatus}</span>
              </div>
            )}

            <div className="divide-y divide-gray-50">
              {permissions.map(item => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex gap-3.5 items-start">
                    <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} mt-1 shrink-0`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-md">{item.desc}</p>
                    </div>
                  </div>

                  {/* iOS Toggle Slider */}
                  <button
                    id={`toggle-${item.id}`}
                    onClick={() => togglePermission(item.id)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                      item.active ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        item.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side metadata preview helper */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Manifest Sync Preview</h3>
            
            <div className="p-4 bg-gray-950 text-emerald-400 rounded-2xl border border-gray-900 font-mono text-[10px] space-y-1 shadow-sm select-text">
              <p className="text-gray-500">{"//" + " metadata.json"}</p>
              <p>{"{"}</p>
              <p className="pl-4">{"\"name\": \"Sovereign Trinity\","}</p>
              <p className="pl-4">{"\"requestFramePermissions\": ["}</p>
              {permissions
                .filter(p => p.active)
                .map((p, i, arr) => (
                  <p key={p.id} className="pl-8">
                    {"\""}{p.id}{"\""}{i < arr.length - 1 ? "," : ""}
                  </p>
                ))}
              <p className="pl-4">{"],"}</p>
              <p className="pl-4">{"\"majorCapabilities\": ["}</p>
              <p className="pl-8">{"\"MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API\""}</p>
              <p className="pl-4">{"]"}</p>
              <p>{"}"}</p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Modifying these settings directly reconstructs the `metadata.json` properties list.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-3xl p-5 text-amber-800 text-xs leading-relaxed flex gap-3">
            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Secure Browser Context:</strong> Hardware tokens, webcams, and microphones require full user approval directly on first run inside the app's browser window.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
