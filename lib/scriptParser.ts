import { ScriptCommand } from '@/types/serial';

/**
 * 解析脚本文本为命令数组
 */
export function parseScript(script: string): ScriptCommand[] {
  if (!script || !script.trim()) {
    throw new Error('脚本内容为空');
  }

  const lines = script
    .split('\n')
    .map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }))
    .filter(line => line.text && !line.text.startsWith('#'));

  const commands: ScriptCommand[] = [];
  const loopStack: number[] = [];

  for (const { text, lineNumber } of lines) {
    try {
      if (text.startsWith('SEND ')) {
        const data = text.substring(5).trim();
        if (!data) {
          throw new Error('SEND 命令缺少数据');
        }
        // 移除首尾引号
        const cleaned = data.replace(/^["']|["']$/g, '');
        commands.push({ type: 'SEND', value: cleaned });
      } 
      else if (text.startsWith('DELAY ')) {
        const delayStr = text.substring(6).trim();
        const delay = parseInt(delayStr);
        
        if (isNaN(delay) || delay < 0) {
          throw new Error(`无效的延时值: ${delayStr}`);
        }
        if (delay > 60000) {
          throw new Error(`延时值过大: ${delay}ms (最大 60000ms)`);
        }
        
        commands.push({ type: 'DELAY', value: delay.toString() });
      } 
      else if (text.startsWith('LOOP ')) {
        const countStr = text.substring(5).trim();
        const count = parseInt(countStr);
        
        if (isNaN(count) || count < 1) {
          throw new Error(`无效的循环次数: ${countStr}`);
        }
        if (count > 10000) {
          throw new Error(`循环次数过大: ${count} (最大 10000)`);
        }
        
        loopStack.push(commands.length);
        commands.push({ type: 'LOOP_START', loopCount: count });
      } 
      else if (text === 'END') {
        if (loopStack.length === 0) {
          throw new Error('END 命令没有对应的 LOOP');
        }
        loopStack.pop();
        commands.push({ type: 'LOOP_END' });
      } 
      else {
        throw new Error(`未知命令: ${text}`);
      }
    } catch (error: any) {
      throw new Error(`第 ${lineNumber} 行错误: ${error.message}`);
    }
  }

  if (loopStack.length > 0) {
    throw new Error(`缺少 ${loopStack.length} 个 END 命令`);
  }

  return commands;
}

/**
 * 执行脚本命令
 */
export async function executeScript(
  commands: ScriptCommand[],
  sendCallback: (data: string) => Promise<void>,
  onProgress?: (current: number, total: number) => void,
  shouldStop?: () => boolean
): Promise<void> {
  if (!commands || commands.length === 0) {
    throw new Error('没有可执行的命令');
  }

  let index = 0;
  const stack: { startIndex: number; count: number; current: number }[] = [];
  const maxIterations = 1000000; // 防止无限循环
  let iterations = 0;

  while (index < commands.length) {
    // 检查是否应该停止
    if (shouldStop && shouldStop()) {
      throw new Error('脚本执行已取消');
    }

    // 防止无限循环
    if (++iterations > maxIterations) {
      throw new Error('脚本执行超时（可能存在无限循环）');
    }

    const command = commands[index];

    if (onProgress) {
      onProgress(index + 1, commands.length);
    }

    try {
      switch (command.type) {
        case 'SEND':
          if (command.value) {
            await sendCallback(command.value);
          }
          index++;
          break;

        case 'DELAY':
          if (command.value) {
            const delay = parseInt(command.value);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          index++;
          break;

        case 'LOOP_START':
          stack.push({
            startIndex: index,
            count: command.loopCount || 1,
            current: 0,
          });
          index++;
          break;

        case 'LOOP_END':
          if (stack.length > 0) {
            const loop = stack[stack.length - 1];
            loop.current++;
            
            if (loop.current < loop.count) {
              // 继续循环
              index = loop.startIndex + 1;
            } else {
              // 循环结束
              stack.pop();
              index++;
            }
          } else {
            throw new Error('END 命令没有对应的 LOOP');
          }
          break;

        default:
          throw new Error(`未知命令类型: ${command.type}`);
      }
    } catch (error: any) {
      throw new Error(`执行命令失败 (索引 ${index}): ${error.message}`);
    }
  }

  if (stack.length > 0) {
    throw new Error('脚本执行异常：存在未完成的循环');
  }
}

/**
 * 验证脚本语法
 */
export function validateScript(script: string): { valid: boolean; error?: string } {
  try {
    parseScript(script);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}
