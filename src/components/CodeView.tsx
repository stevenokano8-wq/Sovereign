import React, { useState } from "react";
import { FileNode } from "../types.js";
import { FileText, Folder, HardDrive, Edit3, Code, Save, Check, Menu, ArrowLeft, Laptop } from "lucide-react";

interface CodeViewProps {
  files: FileNode[];
  onUpdateFile: (path: string, newContent: string) => void;
}

export default function CodeView({ files, onUpdateFile }: CodeViewProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(
    files.length > 0 ? files[0].path : null
  );
  const [editorContent, setEditorContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const [mobileView, setMobileView] = useState<"tree" | "editor">("tree");

  // Ref trackers for auto-detecting updates from agent
  const prevFilesLengthRef = React.useRef(files.length);
  const prevFilesRef = React.useRef(files);

  const selectedFile = files.find(f => f.path === selectedFilePath) || files[0];

  React.useEffect(() => {
    // If the list of files grows or a file content was modified by the agent, auto-select the most recently mutated file!
    if (files.length > 0) {
      if (files.length > prevFilesLengthRef.current) {
        // New file added! Select the newest one
        const newestFile = files[files.length - 1];
        setSelectedFilePath(newestFile.path);
      } else {
        // Check if any file content was modified (updated) compared to previous files
        const changedFile = files.find((f, idx) => {
          const prevF = prevFilesRef.current[idx];
          return prevF && prevF.path === f.path && prevF.content !== f.content;
        });
        if (changedFile) {
          setSelectedFilePath(changedFile.path);
        }
      }
    }
    prevFilesLengthRef.current = files.length;
    prevFilesRef.current = files;
  }, [files]);

  React.useEffect(() => {
    if (selectedFile) {
      setEditorContent(selectedFile.content);
      setIsEditing(false);
    }
  }, [selectedFilePath, selectedFile]);

  const handleSave = () => {
    if (selectedFile) {
      onUpdateFile(selectedFile.path, editorContent);
      setIsEditing(false);
      setIsSavedSuccessfully(true);
      setTimeout(() => setIsSavedSuccessfully(false), 2000);
    }
  };

  return (
    <div id="code-view-container" className="flex flex-col md:flex-row flex-1 h-full min-h-[500px] border border-gray-100 rounded-3xl bg-white overflow-hidden shadow-xs">
      
      {/* File Tree Left Rail - Hidden on mobile if viewing editor */}
      <div className={`w-full md:w-64 border-r border-gray-50 bg-gray-50/50 p-4 flex flex-col h-full ${
        mobileView === "editor" ? "hidden md:flex" : "flex"
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-150 mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-bold tracking-wider uppercase text-gray-500 font-mono">Workspace Storage</span>
          </div>
          {/* Mobile view only helper */}
          <span className="md:hidden text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">Explorer</span>
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <Folder className="h-8 w-8 text-gray-300 stroke-1 mb-2" />
            <p className="text-[11px] text-gray-400 font-mono">No synthesized code files found in local storage yet.</p>
          </div>
        ) : (
          <div className="space-y-1 overflow-y-auto flex-1 max-h-[300px] md:max-h-none">
            <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-gray-400 uppercase font-mono mb-1">
              <Folder className="h-3.5 w-3.5" /> src/generated
            </div>
            
            {files.map(file => {
              const isActive = file.path === selectedFilePath || (!selectedFilePath && file.path === files[0].path);
              const displayName = file.path.replace("src/generated/", "");
              return (
                <button
                  id={`file-node-${file.path.replace(/[^a-z0-9]/g, "-")}`}
                  key={file.path}
                  onClick={() => {
                    setSelectedFilePath(file.path);
                    setMobileView("editor"); // Auto flip to editor on mobile click
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-mono transition-all ${
                    isActive 
                      ? "bg-gray-900 text-white font-semibold shadow-xs" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <FileText className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-gray-400"}`} />
                  <span className="truncate">{displayName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Code Editor Right Container - Hidden on mobile if viewing tree */}
      <div className={`flex-1 flex flex-col h-full bg-gray-950 ${
        mobileView === "tree" ? "hidden md:flex" : "flex"
      }`}>
        {selectedFile ? (
          <>
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-gray-900 bg-gray-920 text-gray-300 font-mono text-[11px]">
              <div className="flex items-center gap-2 min-w-0">
                {/* Back to tree button for mobile screens */}
                <button
                  id="btn-editor-back-to-tree"
                  onClick={() => setMobileView("tree")}
                  className="md:hidden p-1 bg-gray-850 hover:bg-gray-800 text-gray-300 rounded-lg mr-1 flex items-center justify-center shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                
                <Code className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-gray-200 font-semibold truncate text-[10px] sm:text-xs" title={selectedFile.path}>{selectedFile.path.split("/").pop()}</span>
                <span className="text-[8px] sm:text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-sm uppercase shrink-0">{selectedFile.language}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isSavedSuccessfully && (
                  <span className="text-emerald-400 flex items-center gap-1 text-[9px] sm:text-[10px]">
                    <Check className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
                
                {isEditing ? (
                  <>
                    <button
                      id="btn-editor-cancel"
                      onClick={() => {
                        setEditorContent(selectedFile.content);
                        setIsEditing(false);
                      }}
                      className="px-2 py-1 text-gray-400 hover:text-gray-200 text-[9px] sm:text-[10px] uppercase font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      id="btn-editor-save"
                      onClick={handleSave}
                      className="bg-emerald-600 text-white hover:bg-emerald-500 px-2.5 py-1 rounded-md flex items-center gap-1 text-[9px] sm:text-[10px] font-bold shadow-sm"
                    >
                      <Save className="h-3 w-3" /> Save
                    </button>
                  </>
                ) : (
                  <button
                    id="btn-editor-edit"
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-800 text-gray-200 hover:bg-gray-700 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold"
                  >
                    <Edit3 className="h-3 w-3" /> Mod File
                  </button>
                )}
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 relative flex overflow-hidden min-h-[350px]">
              {/* Line numbers mock column */}
              <div className="bg-gray-920 text-gray-600 px-2 md:px-3.5 py-4 select-none font-mono text-[10px] md:text-xs text-right border-r border-gray-900 space-y-[4px]">
                {Array.from({ length: Math.max(15, editorContent.split("\n").length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              
              {isEditing ? (
                <textarea
                  id="textarea-code-editor"
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="flex-1 w-full h-full bg-transparent text-gray-100 p-4 font-mono text-[11px] md:text-xs focus:outline-none resize-none leading-relaxed space-y-[4px]"
                  spellCheck="false"
                />
              ) : (
                <pre className="flex-1 p-4 overflow-y-auto leading-relaxed text-[11px] md:text-xs font-mono text-gray-200 select-text scrollbar-thin">
                  <code>{selectedFile.content}</code>
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-8 text-gray-500 font-mono">
            {/* Mobile Back button if empty and in editor state */}
            <button onClick={() => setMobileView("tree")} className="md:hidden mb-4 bg-gray-800 px-3 py-1.5 rounded-xl text-xs text-gray-300">Show Explorer</button>
            <Code className="h-12 w-12 text-gray-700 stroke-1 mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-gray-400">No File Loaded</h4>
            <p className="text-[11px] max-w-xs mt-1 text-gray-600">
              When Sovereign Agent begins building, the synthesized code files will appear in this workspace workspace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
