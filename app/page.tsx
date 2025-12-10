'use client';

import { useEffect, useState } from 'react';
import SerialConfig from '@/components/SerialConfig';
import DataTransfer from '@/components/DataTransfer';
import LogViewer from '@/components/LogViewer';
import CommandPanel from '@/components/CommandPanel';
import ScriptEditor from '@/components/ScriptEditor';
import { useSerialPort } from '@/hooks/useSerialPort';
import { isSerialSupported } from '@/lib/serialUtils';

export default function Home() {
  const [isSupported, setIsSupported] = useState(true);
  const [showError, setShowError] = useState(false);
  const { isConnected, logs, error, connect, disconnect, sendData, clearLogs, clearError } = useSerialPort();

  useEffect(() => {
    setIsSupported(isSerialSupported());
  }, []);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleConnect = async (config: any) => {
    const success = await connect(config);
    if (!success) {
      alert('连接失败，请检查串口设备或重试');
    }
  };

  const handleSend = async (data: string, format: 'text' | 'hex') => {
    try {
      await sendData(data, format);
    } catch (error: any) {
      alert(`发送失败: ${error.message || '未知错误'}`);
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md">
          <div className="text-center mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">浏览器不支持</h1>
          </div>
          <p className="text-gray-700 mb-4">
            您的浏览器不支持 Web Serial API。请使用以下浏览器访问：
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
            <li>Chrome 89 或更高版本</li>
            <li>Edge 89 或更高版本</li>
            <li>Opera 75 或更高版本</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>注意：</strong> 必须在 HTTPS 环境下使用（localhost 除外）
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* 错误提示 */}
      {showError && error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md animate-slide-in">
          <div className="flex items-center gap-2">
            <span className="text-xl">❌</span>
            <div>
              <div className="font-bold">错误</div>
              <div className="text-sm">{error}</div>
            </div>
            <button
              onClick={() => {
                setShowError(false);
                clearError();
              }}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">在线串口工具</h1>
            <p className="text-gray-600 mt-1">基于 Web Serial API 的串口调试工具</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isConnected ? '● 已连接' : '○ 未连接'}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧控制面板 */}
        <div className="space-y-4">
          <SerialConfig
            onConnect={handleConnect}
            onDisconnect={disconnect}
            isConnected={isConnected}
          />
          <DataTransfer onSend={handleSend} isConnected={isConnected} />
          <CommandPanel onSend={handleSend} isConnected={isConnected} />
        </div>

        {/* 右侧日志和脚本 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-96">
            <LogViewer logs={logs} onClear={clearLogs} />
          </div>
          <ScriptEditor
            onSend={async (data) => await sendData(data, 'text')}
            isConnected={isConnected}
          />
        </div>
      </div>

      {/* 页脚 */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>提示: 首次使用需要授权访问串口设备</p>
      </footer>
    </div>
  );
}
