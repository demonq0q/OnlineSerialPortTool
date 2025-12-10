import { Command, SerialConfig } from '@/types/serial';

const STORAGE_KEYS = {
  COMMANDS: 'serial_commands',
  CONFIG: 'serial_config',
  SCRIPTS: 'serial_scripts',
};

export function saveCommands(commands: Command[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.COMMANDS, JSON.stringify(commands));
  }
}

export function loadCommands(): Command[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.COMMANDS);
    return data ? JSON.parse(data) : [];
  }
  return [];
}

export function saveConfig(config: SerialConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }
}

export function loadConfig(): SerialConfig | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function saveScript(name: string, content: string): void {
  if (typeof window !== 'undefined') {
    const scripts = loadScripts();
    scripts[name] = content;
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
  }
}

export function loadScripts(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
    return data ? JSON.parse(data) : {};
  }
  return {};
}

export function deleteScript(name: string): void {
  if (typeof window !== 'undefined') {
    const scripts = loadScripts();
    delete scripts[name];
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
  }
}
