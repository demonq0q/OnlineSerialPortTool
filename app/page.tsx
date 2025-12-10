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
  const { isConnected, logs, connect, disconnect, sendData, clearLogs } = useSerialPort();

  useEffect(() => {
    setIsSupported(isSerialSupported());
  }, []);

  const handleConnect = async (config: any) => {
    const success = await connect(config);
    if (!success) {
      alert('连接失败，请检查串口设备');
    }
  };

  const handleSend = async (data: string, format: 'text' | 'hex') => {
    try {
      await sendData(data, format);
    } catch (error) {
      alert('发送失败: ' + error);
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">浏览器不支持</h1>
          <p className="text-gray-700 mb-4">
            您的浏览器不支持 Web Serial API。请使用以下浏览器：
          </p>
          <ul className="list-disc list-inside text-gray-600">
            <li>Chrome 89+</li>
            <li>Edge 89+</li>
            <li>Opera 75+</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            注意：必须在 HTTPS 环境下使用（localhost 除外）
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">在线串口工具</h1>
        <p className="text-gray-600 mt-1">基于 Web Serial API 的串口调试工具</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <SerialConfig
            onConnect={handleConnect}
            onDisconnect={disconnect}
            isConnected={isConnected}
          />
          <DataTransfer onSend={handleSend} isConnected={isConnected} />
          <CommandPanel onSend={handleSend} isConnected={isConnected} />
        </div>

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
    </div>
  );
}
