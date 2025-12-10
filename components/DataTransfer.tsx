'use client';

import { useState } from 'react';
import { DataFormat } from '@/types/serial';
import { isValidHex } from '@/lib/dataConverter';

interface DataTransferProps {
  onSend: (data: string, format: DataFormat) => void;
  isConnected: boolean;
}

export default function DataTransfer({ onSend, isConnected }: DataTransferProps) {
  const [input, setInput] = useState('');
  const [format, setFormat] = useState<DataFormat>('text');
  const [lineEnding, setLineEnding] = useState<'none' | 'LF' | 'CR' | 'CRLF'>('CRLF');
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    setError(null);
    
    if (!input.trim()) {
      setError('请输入要发送的数据');
      return;
    }

    let data = input;
    
    if (format === 'text') {
      switch (lineEnding) {
        case 'LF':
          data += '\n';
          break;
        case 'CR':
          data += '\r';
          break;
        case 'CRLF':
          data += '\r\n';
          break;
      }
    } else if (format === 'hex') {
      if (!isValidHex(input)) {
        setError('无效的十六进制格式，请输入如: 01 02 03 或 010203');
        return;
      }
    }

    try {
      onSend(data, format);
      // 发送成功后清空输入（可选）
      // setInput('');
    } catch (err: any) {
      setError(err.message || '发送失败');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFormatChange = (newFormat: DataFormat) => {
    setFormat(newFormat);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">数据发送</h2>
      
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => handleFormatChange('text')}
          className={`px-4 py-1 rounded transition-colors ${
            format === 'text' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          文本
        </button>
        <button
          onClick={() => handleFormatChange('hex')}
          className={`px-4 py-1 rounded transition-colors ${
            format === 'hex' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          十六进制
        </button>
        
        {format === 'text' && (
          <select
            value={lineEnding}
            onChange={(e) => setLineEnding(e.target.value as any)}
            className="ml-auto px-3 py-1 border rounded"
            title="选择换行符"
          >
            <option value="none">无换行</option>
            <option value="LF">LF (\n)</option>
            <option value="CR">CR (\r)</option>
            <option value="CRLF">CRLF (\r\n)</option>
          </select>
        )}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          format === 'hex' 
            ? '输入十六进制数据，如: 01 02 03 或 010203' 
            : '输入文本数据 (Ctrl+Enter 发送)'
        }
        className={`w-full h-24 px-3 py-2 border rounded-md resize-none font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isConnected ? 'bg-gray-100 cursor-not-allowed' : ''
        } ${error ? 'border-red-500' : ''}`}
        disabled={!isConnected}
      />

      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          title={isConnected ? 'Ctrl+Enter 快捷发送' : '请先连接串口'}
        >
          发送
        </button>
        <button
          onClick={() => {
            setInput('');
            setError(null);
          }}
          disabled={!input}
          className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          清空
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        提示: 按 Ctrl+Enter 快速发送
      </div>
    </div>
  );
}
