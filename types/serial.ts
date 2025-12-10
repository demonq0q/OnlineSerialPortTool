export interface SerialConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  direction: 'send' | 'receive';
  data: Uint8Array;
  displayText: string;
}

export interface Command {
  id: string;
  name: string;
  data: string;
  format: 'text' | 'hex';
  description?: string;
}

export interface SerialPortInfo {
  id: string;
  port: SerialPort;
  config: SerialConfig;
  isConnected: boolean;
  name: string;
}

export type DataFormat = 'text' | 'hex';

export interface ScriptCommand {
  type: 'SEND' | 'DELAY' | 'LOOP_START' | 'LOOP_END';
  value?: string;
  loopCount?: number;
}
