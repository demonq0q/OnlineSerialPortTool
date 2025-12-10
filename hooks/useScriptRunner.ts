import { useState, useCallback, useRef } from 'react';
import { parseScript, executeScript, validateScript } from '@/lib/scriptParser';

export function useScriptRunner(sendCallback: (data: string) => Promise<void>) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const shouldStopRef = useRef(false);

  const runScript = useCallback(async (script: string): Promise<void> => {
    if (isRunning) {
      throw new Error('脚本正在运行中');
    }

    try {
      setIsRunning(true);
      setError(null);
      setProgress({ current: 0, total: 0 });
      shouldStopRef.current = false;

      // 验证脚本
      const validation = validateScript(script);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 解析脚本
      const commands = parseScript(script);
      
      // 执行脚本
      await executeScript(
        commands,
        sendCallback,
        (current, total) => setProgress({ current, total }),
        () => shouldStopRef.current
      );

      setProgress({ current: 0, total: 0 });
    } catch (error: any) {
      console.error('脚本执行错误:', error);
      setError(error.message || '未知错误');
      throw error;
    } finally {
      setIsRunning(false);
      shouldStopRef.current = false;
    }
  }, [isRunning, sendCallback]);

  const stopScript = useCallback(() => {
    if (isRunning) {
      shouldStopRef.current = true;
    }
  }, [isRunning]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRunning,
    progress,
    error,
    runScript,
    stopScript,
    clearError,
  };
}
