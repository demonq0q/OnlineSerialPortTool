'use client';

import { useState, useEffect } from 'react';
import { SerialConfig } from '@/types/serial';
import { BAUD_RATES, DEFAULT_CONFIG } from '@/lib/serialUtils';
import { loadConfig, saveConfig } from '@/lib/storage';

interface SerialConfigProps {
  onConnect: (config: SerialConfig) => void;
  onDisconnect: () => void;
  isConnected: boolean;
}

export default function SerialConfigComponent({ onConnect, onDisconnect, isConnected }: SerialConfigProps) {
  const [config, setConfig] = useState<SerialConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setConfig(saved);
    }
  }, []);

  const handleConnect = () => {
    saveConfig(config);
    onConnect(config);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">串口配置</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">波特率</label>
          <select
            value={config.baudRate}
            onChange={(e) => setConfig({ ...config, baudRate: Number(e.target.value) })}
            disabled={isConnected}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          >
            {BAUD_RATES.map(rate => (
              <option key={rate} value={rate}>{rate}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">数据位</label>
          <select
            value={config.dataBits}
            onChange={(e) => setConfig({ ...config, dataBits: Number(e.target.value) as 7 | 8 })}
            disabled={isConnected}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          >
            <option value={7}>7</option>
            <option value={8}>8</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">停止位</label>
          <select
            value={config.stopBits}
            onChange={(e) => setConfig({ ...config, stopBits: Number(e.target.value) as 1 | 2 })}
            disabled={isConnected}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">校验位</label>
          <select
            value={config.parity}
            onChange={(e) => setConfig({ ...config, parity: e.target.value as any })}
            disabled={isConnected}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
          >
            <option value="none">无</option>
            <option value="even">偶校验</option>
            <option value="odd">奇校验</option>
          </select>
        </div>
      </div>

      <button
        onClick={isConnected ? onDisconnect : handleConnect}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          isConnected
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isConnected ? '断开连接' : '连接串口'}
      </button>
    </div>
  );
}
