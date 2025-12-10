import { useState, useCallback } from 'react';
import { parseScript, executeScript } from '@/lib/scriptParser';

export function useScriptRunner(sendCallback: (data: string) => Promise<void>) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const runScript = useCallback(async (script: string) => {
    if (isRunning) return;

    try {
      setIsRunning(true);
      const commands = parseScript(script);
      
      await executeScript(
        commands,
        sendCallback,
        (current, total) => setProgress({ current, total })
      );
    } catch (error) {
      console.error('脚本执行错误:', error);
      throw error;
    } finally {
      setIsRunning(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [isRunning, sendCallback]);

  return {
    isRunning,
    progress,
    runScript,
  };
}
