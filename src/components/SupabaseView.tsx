import React, { useState } from "react";
import { Database, Table, Terminal, RefreshCw, Layers, CheckCircle, Search, Play, FileText, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function SupabaseView() {
  const [selectedTable, setSelectedTable] = useState("conversations");
  const [queryText, setQueryText] = useState("SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 50;");
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResults, setQueryResults] = useState<any[]>([
    { id: "msg-101", role: "user", content: "Synthesize full stack container structure", timestamp: "2026-07-01 17:15:32" },
    { id: "msg-102", role: "assistant", content: "I am configuring your Trinity Lobe workspace now.", timestamp: "2026-07-01 17:15:34" },
    { id: "msg-103", role: "user", content: "Inject PostgreSQL storage variables", timestamp: "2026-07-01 17:16:11" }
  ]);

  const [schemaInfo, setSchemaInfo] = useState({
    conversations: [
      { name: "id", type: "VARCHAR(255)", primary: true },
      { name: "role", type: "VARCHAR(50)", primary: false },
      { name: "content", type: "TEXT", primary: false },
      { name: "timestamp", type: "TIMESTAMP", primary: false }
    ],
    tasks: [
      { name: "id", type: "VARCHAR(255)", primary: true },
      { name: "name", type: "VARCHAR(255)", primary: false },
      { name: "status", type: "VARCHAR(50)", primary: false },
      { name: "progress", type: "INTEGER", primary: false },
      { name: "active_subtask_index", type: "INTEGER", primary: false }
    ],
    subtasks: [
      { name: "id", type: "VARCHAR(255)", primary: true },
      { name: "task_id", type: "VARCHAR(255)", primary: false },
      { name: "name", type: "VARCHAR(255)", primary: false },
      { name: "status", type: "VARCHAR(50)", primary: false },
      { name: "logs", type: "TEXT[]", primary: false }
    ]
  });

  const runQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      // Mock results based on query target
      if (queryText.toLowerCase().includes("tasks")) {
        setQueryResults([
          { id: "task-100", name: "Configure PostgreSQL clusters", status: "completed", progress: 100 },
          { id: "task-101", name: "Deploy Redis hot cache layers", status: "completed", progress: 100 },
          { id: "task-102", name: "Adjust UI viewport screens", status: "running", progress: 65 }
        ]);
      } else {
        setQueryResults([
          { id: "msg-101", role: "user", content: "Synthesize full stack container structure", timestamp: "2026-07-01 17:15:32" },
          { id: "msg-102", role: "assistant", content: "I am configuring your Trinity Lobe workspace now.", timestamp: "2026-07-01 17:15:34" }
        ]);
      }
    }, 800);
  };

  return (
    <div id="supabase-panel-root" className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[85vh] font-sans">
      
      {/* Left Column: Tables list and Schema viewer */}
      <div className="w-full lg:w-72 flex flex-col gap-6">
        
        {/* Table Selector */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4.5 w-4.5 text-emerald-500 fill-emerald-100" />
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider font-mono">Supabase Tables</h3>
          </div>

          <div className="space-y-1">
            {Object.keys(schemaInfo).map(tbl => (
              <button
                id={`btn-tbl-${tbl}`}
                key={tbl}
                onClick={() => {
                  setSelectedTable(tbl);
                  setQueryText(`SELECT * FROM ${tbl} LIMIT 50;`);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-mono transition-colors ${
                  selectedTable === tbl 
                    ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200" 
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Table className="h-4 w-4 text-emerald-600" /> {tbl}</span>
                <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">Postgres</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schema Explorer */}
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-indigo-500" />
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider font-mono">Schema Columns</h3>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
            {schemaInfo[selectedTable as keyof typeof schemaInfo]?.map(col => (
              <div key={col.name} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                <span className={`font-semibold ${col.primary ? "text-amber-600 flex items-center gap-1" : "text-gray-700"}`}>
                  {col.name} {col.primary && <span className="text-[9px] bg-amber-50 text-amber-700 px-1 rounded">PK</span>}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: SQL Terminal and Results Table */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* SQL Query Terminal */}
        <div className="bg-gray-950 text-gray-200 rounded-3xl overflow-hidden shadow-md flex flex-col">
          <div className="bg-gray-920 px-5 py-3 border-b border-gray-900 flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2 text-gray-400">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>SQL QUERY TERMINAL</span>
            </div>
            
            <button
              id="btn-exec-sql"
              onClick={runQuery}
              disabled={isExecuting}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-[11px]"
            >
              {isExecuting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-white text-emerald-600" />}
              Run Query
            </button>
          </div>

          <textarea
            id="textarea-sql-query"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="w-full bg-transparent p-4 font-mono text-xs text-emerald-400 focus:outline-none h-24 resize-none leading-relaxed"
            spellCheck="false"
          />
        </div>

        {/* Results Viewer */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[300px]">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-500" />
              <h3 className="font-bold text-sm text-gray-800 font-display">Dataset Results</h3>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full font-mono">
              {queryResults.length} records returned
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            {queryResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 font-mono">
                <AlertCircle className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-xs">Zero rows matching the query selector.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-gray-600 font-mono">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                    {Object.keys(queryResults[0]).map(key => (
                      <th key={key} className="p-4">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {queryResults.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/30">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="p-4 truncate max-w-sm" title={String(val)}>
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
