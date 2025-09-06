"use client";
import { useState } from "react";

export default function Terminal() {
  const [logs, setLogs] = useState<string[]>([]);

  // Example: function to add logs
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  return (
    <div className="bg-black text-green-400 font-mono text-sm rounded-md p-3 mt-4 h-48 overflow-y-auto shadow-lg">
      {logs.length === 0 ? (
        <p className="text-gray-500">No logs yet...</p>
      ) : (
        logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {log}
          </div>
        ))
      )}
    </div>
  );
}
