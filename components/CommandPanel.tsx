'use client';

import { useState, useEffect } from 'react';
import { Command } from '@/types/serial';
import { loadCommands, saveCommands } from '@/lib/storage';

interface CommandPanelProps {
  onSend: (data: string, format: 'text' | 'hex') => void;
  isConnected: boolean;
}

export default function CommandPanel({ onSend, isConnected }: CommandPanelProps) {
  const [commands, setCommands] = useState<Command[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCommand, setNewCommand] = useState<Omit<Command, 'id'>>({
    name: '',
    data: '',
    format: 'text',
    description: '',
  });

  useEffect(() => {
    setCommands(loadCommands());
  }, []);

  const handleAddCommand = () => {
    if (!newCommand.name || !newCommand.data) {
      alert('请填写命令名称和数据');
      return;
    }

    const command: Command = {
      ...newCommand,
      id: Date.now().toString(),
    };

    const updated = [...commands, command];
    setCommands(updated);
    saveCommands(updated);
    setShowAdd(false);
    setNewCommand({ name: '', data: '', format: 'text', description: '' });
  };

  const handleDeleteCommand = (id: string) => {
    const updated = commands.filter(cmd => cmd.id !== id);
    setCommands(updated);
    saveCommands(updated);
  };

  const handleSendCommand = (cmd: Command) => {
    onSend(cmd.data, cmd.format);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">自定义命令</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showAdd ? '取消' : '添加'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <input
            type="text"
            placeholder="命令名称"
            value={newCommand.name}
            onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="命令数据"
            value={newCommand.data}
            onChange={(e) => setNewCommand({ ...newCommand, data: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="描述（可选）"
            value={newCommand.description}
            onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
            className="w-full px-3 py-2 border rounded mb-2"
          />
          <div className="flex gap-2 mb-2">
            <label className="flex items-center">
              <input
                type="radio"
                checked={newCommand.format === 'text'}
                onChange={() => setNewCommand({ ...newCommand, format: 'text' })}
                className="mr-1"
              />
              文本
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={newCommand.format === 'hex'}
                onChange={() => setNewCommand({ ...newCommand, format: 'hex' })}
                className="mr-1"
              />
              十六进制
            </label>
          </div>
          <button
            onClick={handleAddCommand}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            保存命令
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {commands.length === 0 ? (
          <div className="text-gray-500 text-center py-8">暂无自定义命令</div>
        ) : (
          commands.map((cmd) => (
            <div key={cmd.id} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-medium">{cmd.name}</div>
                <div className="text-sm text-gray-600 font-mono">{cmd.data}</div>
                {cmd.description && (
                  <div className="text-xs text-gray-500">{cmd.description}</div>
                )}
              </div>
              <button
                onClick={() => handleSendCommand(cmd)}
                disabled={!isConnected}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
              >
                发送
              </button>
              <button
                onClick={() => handleDeleteCommand(cmd.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
