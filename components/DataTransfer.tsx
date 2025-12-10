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

  const handleSend = () => {
    if (!input.trim()) return;

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
        alert('无效的十六进制格式');
        return;
      }
    }

    onSend(data, format);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">数据发送</h2>
      
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setFormat('text')}
          className={`px-4 py-1 rounded ${
            format === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          文本
        </button>
        <button
          onClick={() => setFormat('hex')}
          className={`px-4 py-1 rounded ${
            format === 'hex' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          十六进制
        </button>
        
        {format === 'text' && (
          <select
            value={lineEnding}
            onChange={(e) => setLineEnding(e.target.value as any)}
            className="ml-auto px-3 py-1 border rounded"
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
        onKeyPress={handleKeyPress}
        placeholder={format === 'hex' ? '输入十六进制数据，如: 01 02 03' : '输入文本数据'}
        className="w-full h-24 px-3 py-2 border rounded-md resize-none font-mono"
        disabled={!isConnected}
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          发送
        </button>
        <button
          onClick={() => setInput('')}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          清空
        </button>
      </div>
    </div>
  );
}
