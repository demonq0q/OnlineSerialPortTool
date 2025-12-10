'use client';

import { useState, useEffect } from 'react';
import { loadScripts, saveScript, deleteScript } from '@/lib/storage';
import { useScriptRunner } from '@/hooks/useScriptRunner';
import { validateScript } from '@/lib/scriptParser';

interface ScriptEditorProps {
  onSend: (data: string) => Promise<void>;
  isConnected: boolean;
}

const EXAMPLE_SCRIPT = `# AT 命令测试示例
SEND "AT\\r\\n"
DELAY 1000
SEND "AT+GMR\\r\\n"
DELAY 1000

# 循环发送测试
LOOP 3
  SEND "PING\\r\\n"
  DELAY 500
END`;

export default function ScriptEditor({ onSend, isConnected }: ScriptEditorProps) {
  const [scripts, setScripts] = useState<Record<string, string>>({});
  const [currentScript, setCurrentScript] = useState('');
  const [scriptName, setScriptName] = useState('');
  const [selectedScript, setSelectedScript] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isRunning, progress, error, runScript, stopScript, clearError } = useScriptRunner(onSend);

  useEffect(() => {
    setScripts(loadScripts());
  }, []);

  useEffect(() => {
    if (currentScript.trim()) {
      const result = validateScript(currentScript);
      setValidationError(result.valid ? null : result.error || null);
    } else {
      setValidationError(null);
    }
  }, [currentScript]);

  const handleSave = () => {
    if (!scriptName.trim()) {
      alert('请输入脚本名称');
      return;
    }

    if (!currentScript.trim()) {
      alert('脚本内容不能为空');
      return;
    }

    const validation = validateScript(currentScript);
    if (!validation.valid) {
      alert(`脚本语法错误:\n${validation.error}`);
      return;
    }

    saveScript(scriptName, currentScript);
    const updated = { ...scripts, [scriptName]: currentScript };
    setScripts(updated);
    setSelectedScript(scriptName);
    alert('脚本已保存');
  };

  const handleLoad = (name: string) => {
    if (!name) {
      setSelectedScript('');
      setScriptName('');
      setCurrentScript('');
      return;
    }

    setSelectedScript(name);
    setScriptName(name);
    setCurrentScript(scripts[name] || '');
    setValidationError(null);
    clearError();
  };

  const handleDelete = (name: string) => {
    if (!confirm(`确定删除脚本 "${name}" 吗？`)) {
      return;
    }

    deleteScript(name);
    const updated = { ...scripts };
    delete updated[name];
    setScripts(updated);
    
    if (selectedScript === name) {
      setSelectedScript('');
      setScriptName('');
      setCurrentScript('');
    }
  };

  const handleRun = async () => {
    if (!currentScript.trim()) {
      alert('脚本内容为空');
      return;
    }

    if (!isConnected) {
      alert('请先连接串口');
      return;
    }

    clearError();
    
    try {
      await runScript(currentScript);
      alert('脚本执行完成');
    } catch (err: any) {
      alert(`脚本执行失败:\n${err.message || '未知错误'}`);
    }
  };

  const handleNew = () => {
    if (currentScript.trim() && !confirm('当前脚本未保存，确定要新建吗？')) {
      return;
    }
    setSelectedScript('');
    setScriptName('');
    setCurrentScript('');
    setValidationError(null);
    clearError();
  };

  const loadExample = () => {
    if (currentScript.trim() && !confirm('当前脚本未保存，确定要加载示例吗？')) {
      return;
    }
    setCurrentScript(EXAMPLE_SCRIPT);
    setScriptName('示例脚本');
    setSelectedScript('');
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
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isRunning}
          />
          <button
            onClick={handleSave}
            disabled={isRunning || !currentScript.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            保存
          </button>
          <button
            onClick={handleNew}
            disabled={isRunning}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="新建脚本"
          >
            新建
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <select
            value={selectedScript}
            onChange={(e) => handleLoad(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            disabled={isRunning}
          >
            <option value="">选择已保存的脚本...</option>
            {Object.keys(scripts).sort().map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            onClick={loadExample}
            disabled={isRunning}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            加载示例
          </button>
        </div>
      </div>

      <textarea
        value={currentScript}
        onChange={(e) => setCurrentScript(e.target.value)}
        placeholder='# 在此编写脚本，或点击"加载示例"查看示例代码'
        className={`w-full h-64 px-3 py-2 border rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          validationError ? 'border-red-500' : ''
        }`}
        disabled={isRunning}
      />

      {validationError && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <span className="font-bold">语法错误: </span>
          {validationError}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <span className="font-bold">执行错误: </span>
          {error}
        </div>
      )}

      {isRunning && (
        <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
          正在执行: {progress.current} / {progress.total} 条命令
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleRun}
          disabled={!isConnected || isRunning || !currentScript.trim() || !!validationError}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          title={!isConnected ? '请先连接串口' : ''}
        >
          {isRunning ? '运行中...' : '运行脚本'}
        </button>
        
        {isRunning && (
          <button
            onClick={stopScript}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            停止
          </button>
        )}
        
        {selectedScript && !isRunning && (
          <button
            onClick={() => handleDelete(selectedScript)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <div className="font-bold mb-2">脚本语法说明:</div>
        <div className="space-y-1 font-mono text-xs">
          <div>• SEND "数据" - 发送数据（支持 \r \n 转义）</div>
          <div>• DELAY 毫秒 - 延时（最大 60000ms）</div>
          <div>• LOOP 次数 ... END - 循环（最大 10000 次）</div>
          <div>• # 注释 - 单行注释</div>
        </div>
      </div>
    </div>
  );
}
