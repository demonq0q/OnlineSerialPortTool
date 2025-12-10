import { useState, useCallback, useRef } from 'react';
import { SerialConfig, LogEntry } from '@/types/serial';
import { openSerialPort, closeSerialPort, writeToPort, requestSerialPort } from '@/lib/serialUtils';
import { textToBytes, hexToBytes, bytesToText, bytesToHex } from '@/lib/dataConverter';

export function useSerialPort() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addLog = useCallback((direction: 'send' | 'receive', data: Uint8Array) => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      direction,
      data,
      displayText: bytesToText(data),
    };
    
    setLogs(prev => {
      const newLogs = [...prev, entry];
      return newLogs.slice(-1000); // 保留最近1000条
    });
  }, []);

  const startReading = useCallback(async (serialPort: SerialPort) => {
    if (!serialPort.readable) return;

    abortControllerRef.current = new AbortController();
    const reader = serialPort.readable.getReader();
    readerRef.current = reader;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done || abortControllerRef.current?.signal.aborted) {
          break;
        }
        if (value) {
          addLog('receive', value);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('读取串口数据错误:', error);
      }
    } finally {
      reader.releaseLock();
      readerRef.current = null;
    }
  }, [addLog]);

  const connect = useCallback(async (config: SerialConfig) => {
    try {
      const selectedPort = await requestSerialPort();
      if (!selectedPort) return false;

      await openSerialPort(selectedPort, config);
      setPort(selectedPort);
      setIsConnected(true);
      
      startReading(selectedPort);
      return true;
    } catch (error) {
      console.error('连接失败:', error);
      return false;
    }
  }, [startReading]);

  const disconnect = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (error) {
        console.error('取消读取失败:', error);
      }
    }

    if (port) {
      await closeSerialPort(port);
      setPort(null);
      setIsConnected(false);
    }
  }, [port]);

  const sendData = useCallback(async (data: string, format: 'text' | 'hex' = 'text') => {
    if (!port || !isConnected) {
      throw new Error('串口未连接');
    }

    let bytes: Uint8Array;
    if (format === 'hex') {
      bytes = hexToBytes(data);
    } else {
      bytes = textToBytes(data);
    }

    await writeToPort(port, bytes);
    addLog('send', bytes);
  }, [port, isConnected, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    port,
    isConnected,
    logs,
    connect,
    disconnect,
    sendData,
    clearLogs,
  };
}
