import { useState, useCallback, useRef, useEffect } from 'react';
import { SerialConfig, LogEntry } from '@/types/serial';
import { openSerialPort, closeSerialPort, writeToPort, requestSerialPort } from '@/lib/serialUtils';
import { textToBytes, hexToBytes, bytesToText } from '@/lib/dataConverter';

const MAX_LOG_ENTRIES = 1000;

export function useSerialPort() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isReadingRef = useRef(false);

  // 清理函数
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  const addLog = useCallback((direction: 'send' | 'receive', data: Uint8Array) => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      direction,
      data,
      displayText: bytesToText(data),
    };
    
    setLogs(prev => {
      const newLogs = [...prev, entry];
      return newLogs.slice(-MAX_LOG_ENTRIES);
    });
  }, []);

  const startReading = useCallback(async (serialPort: SerialPort) => {
    if (!serialPort.readable || isReadingRef.current) return;

    isReadingRef.current = true;
    abortControllerRef.current = new AbortController();
    
    try {
      const reader = serialPort.readable.getReader();
      readerRef.current = reader;

      while (true) {
        const { value, done } = await reader.read();
        
        if (done || abortControllerRef.current?.signal.aborted) {
          break;
        }
        
        if (value && value.length > 0) {
          addLog('receive', value);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && error.name !== 'NetworkError') {
        console.error('读取串口数据错误:', error);
        setError(`读取错误: ${error.message}`);
      }
    } finally {
      if (readerRef.current) {
        try {
          readerRef.current.releaseLock();
        } catch (e) {
          // Ignore lock release errors
        }
        readerRef.current = null;
      }
      isReadingRef.current = false;
    }
  }, [addLog]);

  const connect = useCallback(async (config: SerialConfig): Promise<boolean> => {
    try {
      setError(null);
      
      const selectedPort = await requestSerialPort();
      if (!selectedPort) {
        setError('未选择串口设备');
        return false;
      }

      await openSerialPort(selectedPort, config);
      setPort(selectedPort);
      setIsConnected(true);
      
      // 开始读取数据
      startReading(selectedPort);
      return true;
    } catch (error: any) {
      console.error('连接失败:', error);
      setError(`连接失败: ${error.message || '未知错误'}`);
      return false;
    }
  }, [startReading]);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      
      // 中止读取操作
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // 取消读取器
      if (readerRef.current) {
        try {
          await readerRef.current.cancel();
        } catch (e) {
          // Ignore cancel errors
        }
      }

      // 关闭串口
      if (port) {
        await closeSerialPort(port);
        setPort(null);
      }
      
      setIsConnected(false);
    } catch (error: any) {
      console.error('断开连接失败:', error);
      setError(`断开失败: ${error.message}`);
    }
  }, [port]);

  const sendData = useCallback(async (data: string, format: 'text' | 'hex' = 'text'): Promise<void> => {
    if (!port || !isConnected) {
      throw new Error('串口未连接');
    }

    if (!data) {
      throw new Error('数据不能为空');
    }

    try {
      let bytes: Uint8Array;
      
      if (format === 'hex') {
        bytes = hexToBytes(data);
      } else {
        bytes = textToBytes(data);
      }

      if (bytes.length === 0) {
        throw new Error('转换后的数据为空');
      }

      await writeToPort(port, bytes);
      addLog('send', bytes);
    } catch (error: any) {
      console.error('发送数据失败:', error);
      throw new Error(`发送失败: ${error.message}`);
    }
  }, [port, isConnected, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    port,
    isConnected,
    logs,
    error,
    connect,
    disconnect,
    sendData,
    clearLogs,
    clearError,
  };
}
