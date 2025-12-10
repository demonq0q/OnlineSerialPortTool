import { ScriptCommand } from '@/types/serial';

export function parseScript(script: string): ScriptCommand[] {
  const lines = script.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  const commands: ScriptCommand[] = [];
  
  for (const line of lines) {
    if (line.startsWith('SEND ')) {
      const data = line.substring(5).trim();
      const cleaned = data.replace(/^["']|["']$/g, '');
      commands.push({ type: 'SEND', value: cleaned });
    } else if (line.startsWith('DELAY ')) {
      const delay = parseInt(line.substring(6).trim());
      if (!isNaN(delay)) {
        commands.push({ type: 'DELAY', value: delay.toString() });
      }
    } else if (line.startsWith('LOOP ')) {
      const count = parseInt(line.substring(5).trim());
      if (!isNaN(count)) {
        commands.push({ type: 'LOOP_START', loopCount: count });
      }
    } else if (line === 'END') {
      commands.push({ type: 'LOOP_END' });
    }
  }
  
  return commands;
}

export async function executeScript(
  commands: ScriptCommand[],
  sendCallback: (data: string) => Promise<void>,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  let index = 0;
  const stack: { startIndex: number; count: number; current: number }[] = [];
  
  while (index < commands.length) {
    const command = commands[index];
    
    if (onProgress) {
      onProgress(index + 1, commands.length);
    }
    
    switch (command.type) {
      case 'SEND':
        if (command.value) {
          await sendCallback(command.value);
        }
        index++;
        break;
        
      case 'DELAY':
        if (command.value) {
          await new Promise(resolve => setTimeout(resolve, parseInt(command.value!)));
        }
        index++;
        break;
        
      case 'LOOP_START':
        stack.push({
          startIndex: index,
          count: command.loopCount || 1,
          current: 0
        });
        index++;
        break;
        
      case 'LOOP_END':
        if (stack.length > 0) {
          const loop = stack[stack.length - 1];
          loop.current++;
          if (loop.current < loop.count) {
            index = loop.startIndex + 1;
          } else {
            stack.pop();
            index++;
          }
        } else {
          index++;
        }
        break;
        
      default:
        index++;
    }
  }
}
