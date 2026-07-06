import React, { useState, useEffect } from "react";

const commands = [
  { cmd: "whoami", out: "Vedansh - Information Security Engineer" },
  { cmd: "cat skills.txt", out: "Cloud Strategies\nLinux Operations\nModern Architecture\nNode.js / Python / C++" },
  { cmd: "nmap localhost -p 22,80,443", out: "Starting Nmap...\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http\n443/tcp open https" }
];

export default function TerminalInfo() {
  const [history, setHistory] = useState<{ type: string; text: string }[]>([]);
  const [currentCmdIdx, setCurrentCmdIdx] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentCmdIdx >= commands.length) return;
    
    const cmdStr = commands[currentCmdIdx].cmd;
    
    if (typingText.length < cmdStr.length) {
      const timeout = setTimeout(() => {
        setTypingText(cmdStr.slice(0, typingText.length + 1));
      }, 50 + Math.random() * 50);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      const timeout = setTimeout(() => {
        setHistory(prev => [
          ...prev, 
          { type: 'cmd', text: cmdStr },
          { type: 'out', text: commands[currentCmdIdx].out }
        ]);
        setTypingText("");
        setCurrentCmdIdx(prev => prev + 1);
        setIsTyping(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [typingText, currentCmdIdx]);

  return (
    <div className="w-full max-w-lg bg-[#0d1117] rounded-lg overflow-hidden border border-[#30363d] shadow-2xl font-mono text-sm mx-auto">
      <div className="bg-[#161b22] px-4 py-2 flex items-center gap-2 border-b border-[#30363d]">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        <span className="ml-2 text-[#8b949e] text-xs">bash - user@ns17</span>
      </div>
      <div className="p-4 text-[#e6edf3] min-h-[250px]">
        {history.map((line, i) => (
          <div key={i} className="mb-2">
            {line.type === 'cmd' ? (
              <div><span className="text-[#3fb950]">user@ns17:~$</span> {line.text}</div>
            ) : (
              <pre className="whitespace-pre-wrap text-[#8b949e] font-mono">{line.text}</pre>
            )}
          </div>
        ))}
        {currentCmdIdx < commands.length && (
          <div className="flex items-center">
            <span className="text-[#3fb950] mr-2">user@ns17:~$</span>
            <span>{typingText}</span>
            <span className="w-2 h-4 bg-[#e6edf3] ml-1 animate-pulse"></span>
          </div>
        )}
      </div>
    </div>
  );
}
