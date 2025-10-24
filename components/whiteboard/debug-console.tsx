"use client";

import { useEffect, useState, useRef } from "react";

interface LogEntry {
  timestamp: number;
  message: string;
  type: "log" | "warn" | "error";
}

export function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false); // Hidden by default
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Capture console.log
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      setLogs((prev) => [
        ...prev.slice(-50), // Keep last 50 logs
        {
          timestamp: Date.now(),
          message: args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
            )
            .join(" "),
          type: "log",
        },
      ]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs((prev) => [
        ...prev.slice(-50),
        {
          timestamp: Date.now(),
          message: args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
            )
            .join(" "),
          type: "warn",
        },
      ]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs((prev) => [
        ...prev.slice(-50),
        {
          timestamp: Date.now(),
          message: args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
            )
            .join(" "),
          type: "error",
        },
      ]);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className='fixed bottom-24 right-4 z-50 bg-black text-white px-3 py-2 rounded-lg text-xs font-mono shadow-lg'
      >
        Show Console
      </button>
    );
  }

  return (
    <div className='fixed bottom-24 right-4 z-50 w-96 max-h-96 bg-black/95 text-white rounded-lg shadow-2xl overflow-hidden flex flex-col'>
      <div className='flex items-center justify-between px-3 py-2 border-b border-gray-700'>
        <span className='text-xs font-mono font-bold'>Debug Console</span>
        <div className='flex gap-2'>
          <button
            onClick={() => setLogs([])}
            className='text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded'
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className='text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded'
          >
            Hide
          </button>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono'>
        {logs.length === 0 ? (
          <div className='text-gray-500 italic'>No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-1 rounded ${
                log.type === "error"
                  ? "bg-red-900/30 text-red-300"
                  : log.type === "warn"
                  ? "bg-yellow-900/30 text-yellow-300"
                  : "text-gray-300"
              }`}
            >
              <pre className='whitespace-pre-wrap break-all'>{log.message}</pre>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
