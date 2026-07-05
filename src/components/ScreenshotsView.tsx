import React, { useState } from "react";
import { Camera, Eye, Download, RefreshCw, LayoutGrid, CheckCircle, Info, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

export default function ScreenshotsView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [gallery, setGallery] = useState([
    { id: "scr-1", name: "CEO Dashboard Mockup", ratio: "16:9", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", time: "2 hours ago" },
    { id: "scr-2", name: "Real-time Task Accordion", ratio: "3:2", url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80", time: "1 day ago" },
    { id: "scr-3", name: "Mobile Viewport Simulator", ratio: "9:16", url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80", time: "2 days ago" }
  ]);

  const handleCapture = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGallery(prev => [
        {
          id: `scr-${Date.now()}`,
          name: `Viewport Snapshot (${selectedRatio})`,
          ratio: selectedRatio,
          url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
          time: "Just now"
        },
        ...prev
      ]);
    }, 1500);
  };

  return (
    <div id="screenshots-panel-root" className="flex-1 flex flex-col gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Capture Header */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-4 items-center">
          <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl">
            <Camera className="h-7 w-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 font-display">Sovereign Viewport Screenshots</h2>
            <p className="text-xs text-gray-500 font-mono">Capture and audit layout grids, analyze responsive breakpoints, and catalog screenshot canvases.</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="text-xs font-mono font-bold text-gray-400 uppercase mr-1 hidden sm:block">Aspect Ratio:</div>
          <select
            id="select-screenshot-ratio"
            value={selectedRatio}
            onChange={(e) => setSelectedRatio(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-mono focus:outline-none"
          >
            <option value="16:9">16:9 Desktop</option>
            <option value="3:2">3:2 Tablet</option>
            <option value="4:3">4:3 iPad</option>
            <option value="9:16">9:16 Mobile</option>
            <option value="1:1">1:1 Square</option>
          </select>

          <button
            id="btn-trigger-capture"
            onClick={handleCapture}
            disabled={isGenerating}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 text-white" />
            )}
            Capture Canvas
          </button>
        </div>
      </div>

      {/* Grid: Screenshots Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Layout Snapshot Vault</h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full font-mono">{gallery.length} captured assets</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs group relative flex flex-col">
              
              {/* Aspect Ratio Constraint container */}
              <div className="bg-gray-100 relative overflow-hidden aspect-video">
                <img
                  src={item.url}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Meta Aspect ratio tag */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[9px] font-bold font-mono">
                  {item.ratio}
                </div>
              </div>

              {/* Title & info footer */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-gray-800 font-sans truncate">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">{item.time}</p>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-gray-50">
                  <button
                    id={`btn-view-scr-${item.id}`}
                    onClick={() => { alert(`Opening full viewport capture of ${item.name} in high-fidelity lightbox...`); }}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2 rounded-xl text-[10px] font-sans flex items-center justify-center gap-1 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 text-gray-500" /> View Full
                  </button>
                  <button
                    id={`btn-dl-scr-${item.id}`}
                    onClick={() => { alert(`Zipping selected viewport layout snapshot image...`); }}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 p-2 rounded-xl transition-colors"
                    title="Download Image"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
