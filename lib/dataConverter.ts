/**
 * 文本转字节数组
 */
export function textToBytes(text: string): Uint8Array {
  if (!text) return new Uint8Array(0);
  return new TextEncoder().encode(text);
}

/**
 * 字节数组转文本
 * 如果解码失败，返回十六进制表示
 */
export function bytesToText(bytes: Uint8Array): string {
  if (!bytes || bytes.length === 0) return '';
  
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(bytes);
    
    // 检查是否包含不可打印字符
    if (/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/.test(text)) {
      return bytesToHex(bytes);
    }
    
    return text;
  } catch {
    return bytesToHex(bytes);
  }
}

/**
 * 十六进制字符串转字节数组
 */
export function hexToBytes(hex: string): Uint8Array {
  if (!hex) return new Uint8Array(0);
  
  // 移除所有非十六进制字符
  const cleaned = hex.replace(/[^0-9A-Fa-f]/g, '');
  
  if (cleaned.length === 0) {
    throw new Error('十六进制字符串为空');
  }
  
  if (cleaned.length % 2 !== 0) {
    throw new Error('十六进制字符串长度必须为偶数');
  }
  
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const byte = parseInt(cleaned.substring(i * 2, i * 2 + 2), 16);
    if (isNaN(byte)) {
      throw new Error(`无效的十六进制值: ${cleaned.substring(i * 2, i * 2 + 2)}`);
    }
    bytes[i] = byte;
  }
  
  return bytes;
}

/**
 * 字节数组转十六进制字符串
 */
export function bytesToHex(bytes: Uint8Array): string {
  if (!bytes || bytes.length === 0) return '';
  
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

/**
 * 验证十六进制字符串格式
 */
export function isValidHex(hex: string): boolean {
  if (!hex) return false;
  
  const cleaned = hex.replace(/\s/g, '');
  
  if (cleaned.length === 0) return false;
  if (cleaned.length % 2 !== 0) return false;
  
  return /^[0-9A-Fa-f]+$/.test(cleaned);
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes === 1) return '1 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
