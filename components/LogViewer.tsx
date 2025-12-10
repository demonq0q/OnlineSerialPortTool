'use client';

import { useEffect, useRef, useState } from 'react';
import { LogEntry } from '@/types/serial';
import { formatTimestamp, bytesToHex, bytesToText } from '@/lib/dataConverter';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function LogViewer({ logs, onClear }: LogViewerProps) {
  const [displayFormat, setDisplayFormat] = useState<'text' | 'hex'>('text');
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const exportLogs = () => {
    const content = logs.map(log => {
      const time = formatTimestamp(log.timestamp);
      const dir = log.direction === 'send' ? '发送' : '接收';
      const data = displayFormat === 'hex' ? bytesToHex(log.data) : bytesToText(log.data);
      return `[${time}] ${dir}: ${data}`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">通信日志</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setDisplayFormat(displayFormat === 'text' ? 'hex' : 'text')}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            {displayFormat === 'text' ? '文本' : 'HEX'}
          </button>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            自动滚动
          </label>
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            导出
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            清空
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">暂无日志</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`mb-2 ${
                log.direction === 'send' ? 'text-green-400' : 'text-blue-400'
              }`}
            >
              <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>
              <span className="ml-2 font-bold">
                {log.direction === 'send' ? '→' : '←'}
              </span>
              <span className="ml-2">
                {displayFormat === 'hex' ? bytesToHex(log.data) : log.displayText}
              </span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      <div className="mt-2 text-sm text-gray-500">
        共 {logs.length} 条日志
      </div>
    </div>
  );
}
