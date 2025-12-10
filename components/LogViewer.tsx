'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { LogEntry } from '@/types/serial';
import { formatTimestamp, bytesToHex, bytesToText, formatBytes } from '@/lib/dataConverter';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function LogViewer({ logs, onClear }: LogViewerProps) {
  const [displayFormat, setDisplayFormat] = useState<'text' | 'hex'>('text');
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<'all' | 'send' | 'receive'>('all');
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter(log => log.direction === filter);
  }, [logs, filter]);

  const stats = useMemo(() => {
    const sent = logs.filter(l => l.direction === 'send');
    const received = logs.filter(l => l.direction === 'receive');
    const sentBytes = sent.reduce((sum, l) => sum + l.data.length, 0);
    const receivedBytes = received.reduce((sum, l) => sum + l.data.length, 0);
    
    return {
      total: logs.length,
      sent: sent.length,
      received: received.length,
      sentBytes,
      receivedBytes,
    };
  }, [logs]);

  const exportLogs = () => {
    if (logs.length === 0) return;

    const content = logs.map(log => {
      const time = formatTimestamp(log.timestamp);
      const dir = log.direction === 'send' ? '发送' : '接收';
      const data = displayFormat === 'hex' ? bytesToHex(log.data) : bytesToText(log.data);
      return `[${time}] ${dir}: ${data}`;
    }).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (logs.length > 0 && !confirm('确定要清空所有日志吗？')) {
      return;
    }
    onClear();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold">通信日志</h2>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-2 py-1 text-sm border rounded"
          >
            <option value="all">全部</option>
            <option value="send">发送</option>
            <option value="receive">接收</option>
          </select>
          
          <button
            onClick={() => setDisplayFormat(displayFormat === 'text' ? 'hex' : 'text')}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition-colors"
            title="切换显示格式"
          >
            {displayFormat === 'text' ? '文本' : 'HEX'}
          </button>
          
          <label className="flex items-center gap-1 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="cursor-pointer"
            />
            自动滚动
          </label>
          
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="导出日志"
          >
            导出
          </button>
          
          <button
            onClick={handleClear}
            disabled={logs.length === 0}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="清空日志"
          >
            清空
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {logs.length === 0 ? '暂无日志' : '没有符合筛选条件的日志'}
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`mb-2 break-all ${
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

      <div className="mt-2 text-xs text-gray-600 flex justify-between">
        <span>
          共 {stats.total} 条 | 发送 {stats.sent} 条 ({formatBytes(stats.sentBytes)}) | 
          接收 {stats.received} 条 ({formatBytes(stats.receivedBytes)})
        </span>
        {logs.length >= 1000 && (
          <span className="text-orange-600">已达到最大日志数量 (1000)</span>
        )}
      </div>
    </div>
  );
}
