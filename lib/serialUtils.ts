import { SerialConfig } from '@/types/serial';

export function isSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

export async function requestSerialPort(): Promise<SerialPort | null> {
  if (!isSerialSupported()) {
    throw new Error('Web Serial API 不支持');
  }
  
  try {
    const port = await navigator.serial.requestPort();
    return port;
  } catch (error) {
    console.error('请求串口失败:', error);
    return null;
  }
}

export async function openSerialPort(
  port: SerialPort,
  config: SerialConfig
): Promise<void> {
  try {
    await port.open({
      baudRate: config.baudRate,
      dataBits: config.dataBits,
      stopBits: config.stopBits,
      parity: config.parity,
      flowControl: config.flowControl,
    });
  } catch (error) {
    console.error('打开串口失败:', error);
    throw error;
  }
}

export async function closeSerialPort(port: SerialPort): Promise<void> {
  try {
    if (port.readable?.locked) {
      await port.readable.cancel();
    }
    if (port.writable?.locked) {
      await port.writable.abort();
    }
    await port.close();
  } catch (error) {
    console.error('关闭串口失败:', error);
  }
}

export async function writeToPort(
  port: SerialPort,
  data: Uint8Array
): Promise<void> {
  if (!port.writable) {
    throw new Error('串口不可写');
  }
  
  const writer = port.writable.getWriter();
  try {
    await writer.write(data);
  } finally {
    writer.releaseLock();
  }
}

export const BAUD_RATES = [
  300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600
];

export const DEFAULT_CONFIG: SerialConfig = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none',
};
