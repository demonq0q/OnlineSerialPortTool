'use client';

import { useState, useEffect } from 'react';
import { loadScripts, saveScript, deleteScript } from '@/lib/storage';
import { useScriptRunner } from '@/hooks/useScriptRunner';

interface ScriptEditorProps {
  onSend: (data: string) => Promise<void>;
  isConnected: boolean;
}

export default function ScriptEditor({ onSend, isConnected }: ScriptEditorProps) {
  const [scripts, setScripts] = useState<Record<string, string>>({});
  const [currentScript, setCurrentScript] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [selectedScript, setSelectedScript] = useState('');
  const { isRunning, progress, runScript } = useScriptRunner(onSend);

  useEffect(() => {
    setScripts(loadScripts());
  }, []);

  const handleSave = () => {
    if (!scriptName.trim()) {
      alert('请输入脚本名称');
      return;
    }
    saveScript(scriptName, currentScript);
    setScripts({ ...scripts, [scriptName]: currentScript });
    alert('脚本已保存');
  };

  const handleLoad = (name: string) => {
    setSelectedScript(name);
    setScriptName(name);
    setCurrentScript(scripts[name] || '');
  };

  const handleDelete = (name: string) => {
    if (confirm(`确定删除脚本 "${name}" 吗？`)) {
      deleteScript(name);
      const updated = { ...scripts };
      delete updated[name];
      setScripts(updated);
      if (selectedScript === name) {
        setSelectedScript('');
        setScriptName('');
        setCurrentScript('');
      }
    }
  };

  const handleRun = async () => {
    if (!currentScript.trim()) {
      alert('脚本内容为空');
      return;
    }
    try {
      await runScript(currentScript);
      alert('脚本执行完成');
    } catch (error) {
      alert('脚本执行失败: ' + error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">脚本编辑器</h2>

      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="脚本名称"
            value={scriptName}
            onChange={(e) => setScriptName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
        </div>

        <select
          value={selectedScript}
          onChange={(e) => handleLoad(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        >
          <option value="">选择已保存的脚本...</option>
          {Object.keys(scripts).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <textarea
        value={currentScript}
        onChange={(e) => setCurrentScript(e.target.value)}
        placeholder="# 脚本示例&#10;SEND &quot;AT\r\n&quot;&#10;DELAY 1000&#10;SEND &quot;AT+GMR\r\n&quot;&#10;DELAY 1000&#10;LOOP 3&#10;  SEND &quot;PING\r\n&quot;&#10;  DELAY 500&#10;END"
        className="w-full h-64 px-3 py-2 border rounded font-mono text-sm resize-none"
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleRun}
          disabled={!isConnected || isRunning || !currentScript.trim()}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:bg-gray-300"
        >
          {isRunning ? `运行中 (${progress.current}/${progress.total})` : '运行脚本'}
        </button>
        {selectedScript && (
          <button
            onClick={() => handleDelete(selectedScript)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            删除
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <div className="font-bold mb-1">脚本语法:</div>
        <div>• SEND "数据" - 发送数据</div>
        <div>• DELAY 毫秒 - 延时</div>
        <div>• LOOP 次数 ... END - 循环</div>
        <div>• # 注释</div>
      </div>
    </div>
  );
}
