import React, { useState } from 'react';
import { ANDROID_FILES } from '../androidCode';
import { Folder, File, Code, Terminal, Check } from 'lucide-react';

interface CodeViewProps {
  theme: {
    bg: string;
    hoverBg: string;
    text: string;
    border: string;
    accentBg: string;
  };
}

export default function CodeView({ theme }: CodeViewProps) {
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');

  const fileKeys = Object.keys(ANDROID_FILES);
  const fileData = ANDROID_FILES[selectedFile] || ANDROID_FILES['MainActivity.kt'];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
      
      {/* IDE Window Title Bar */}
      <div className="bg-neutral-950 border-b border-neutral-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
          </div>
          <span className="text-xs text-neutral-400 font-mono pl-3 border-l border-neutral-800">
            Android Studio - DKV_Kas_App
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-neutral-500 font-mono">
          <span>Gradle Sync: </span>
          <span className="text-green-500 font-black flex items-center gap-1">
            <Check className="w-3 h-3 inline" /> SUCCESSFUL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        
        {/* IDE Sidebar - Project Files Explorer */}
        <div className="md:col-span-4 bg-neutral-950/40 border-r border-neutral-800 p-4 space-y-4">
          <div>
            <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-blue-400" /> Project Workspace
            </span>
          </div>

          <div className="space-y-1">
            {fileKeys.map((key) => {
              const item = ANDROID_FILES[key];
              const isSelected = selectedFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center space-x-2.5 transition-all ${
                    isSelected
                      ? 'bg-neutral-800 text-neutral-100 font-bold border-l-2 border-indigo-500'
                      : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-neutral-200'
                  }`}
                >
                  <File className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-neutral-500'}`} />
                  <div className="truncate text-left">
                    <p className="leading-tight font-semibold">{item.name}</p>
                    <p className="text-[9px] text-neutral-600 truncate mt-0.5" title={item.path}>
                      {item.path}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-800/80 pt-4 space-y-2">
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-[10px] text-neutral-500 space-y-1.5 font-mono">
              <p className="font-extrabold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-yellow-500" /> Build Output Console
              </p>
              <div className="text-[9px] text-neutral-500 leading-relaxed font-mono">
                <p>&gt; Task :app:compileDebugKotlin</p>
                <p>&gt; Task :app:mergeDebugResources</p>
                <p className="text-green-500 font-bold">&gt; BUILD SUCCESSFUL in 12s</p>
              </div>
            </div>
          </div>
        </div>

        {/* IDE Code Editor Panel */}
        <div className="md:col-span-8 flex flex-col bg-neutral-950">
          
          {/* Editor Header / Breadcrumbs */}
          <div className="bg-neutral-900/40 px-5 py-2.5 border-b border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span className="truncate">{fileData.path}</span>
            <span className="text-[10px] uppercase text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded font-black">
              {fileData.lang}
            </span>
          </div>

          {/* Code display with syntax style */}
          <div className="flex-1 p-5 overflow-auto max-h-[550px] font-mono text-xs text-neutral-300 bg-neutral-950 leading-relaxed scrollbar-thin scrollbar-thumb-neutral-800">
            <pre className="select-text whitespace-pre overflow-x-auto">
              <code>{fileData.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
