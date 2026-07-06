import React, { useState, useRef } from "react";

export default function InteractiveShell() {
  const [history, setHistory] = useState<{ cmd: string, out: string }[]>([
    { cmd: "", out: "Welcome to NS17 Interactive Shell v1.0.0\nType 'help' to see available commands." }
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;
    
    let out = "";
    switch(cmd.toLowerCase()) {
      case "help": out = "Available commands: help, whoami, clear, projects, echo"; break;
      case "whoami": out = "Vedansh - Infosec Engineer & Developer"; break;
      case "clear": setHistory([]); setInput(""); return;
      case "projects": out = "- Quizzly\n- Cloudflare R2 Client\n- Auto User Activity"; break;
      case "sudo rm -rf /": out = "Nice try. Incident reported. 🚨"; break;
      default: 
        if (cmd.startsWith("echo ")) out = cmd.substring(5);
        else out = `Command not found: ${cmd}`;
    }
    
    setHistory(prev => [...prev, { cmd, out }]);
    setInput("");
  };

  return (
    <div 
      className="w-full max-w-lg bg-black rounded-lg overflow-hidden border border-[#333] shadow-2xl font-mono text-sm cursor-text mx-auto"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-[#111] px-4 py-2 flex items-center justify-between border-b border-[#333]">
        <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
           <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
           <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>
        <div className="text-[#888] text-xs">Interactive Shell</div>
        <div className="w-10"></div>
      </div>
      <div className="p-4 text-[#0f0] h-[300px] overflow-y-auto flex flex-col">
        {history.map((entry, i) => (
          <div key={i} className="mb-3">
            {entry.cmd && <div><span className="text-white">guest@ns17:~$</span> {entry.cmd}</div>}
            {entry.out && <pre className="whitespace-pre-wrap mt-1 opacity-80">{entry.out}</pre>}
          </div>
        ))}
        <form onSubmit={handleCommand} className="flex items-center mt-auto">
          <span className="text-white mr-2">guest@ns17:~$</span>
          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[#0f0]"
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
}
