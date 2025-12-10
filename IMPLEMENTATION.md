# 在线串口工具实现文档

## 项目概述

基于 Web Serial API 的在线串口调试工具，可部署在 Vercel 平台，支持浏览器直接访问串口设备进行调试和通信。

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 库**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks (useState, useReducer)
- **串口通信**: Web Serial API
- **部署平台**: Vercel

## 核心功能模块

### 1. 串口配置模块

**功能描述**：
- 波特率设置：支持常见波特率（9600, 19200, 38400, 57600, 115200 等）
- 数据位：5, 6, 7, 8 位可选
- 停止位：1, 1.5, 2 位可选
- 校验位：无校验、奇校验、偶校验
- 流控制：无、硬件流控、软件流控

**实现要点**：
```typescript
interface SerialConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
}
```

### 2. 数据传输模块

**功能描述**：
- 文本模式：直接发送 ASCII 字符串
- 十六进制模式：以 HEX 格式发送/接收数据
- 二进制模式：原始字节流传输
- 自动换行符处理（CR, LF, CRLF）

**实现要点**：
- 使用 TextEncoder/TextDecoder 处理文本数据
- 实现 HEX 字符串与 Uint8Array 的相互转换
- 支持数据格式实时切换显示

### 3. 自定义命令模块

**功能描述**：
- 命令模板管理（增删改查）
- 快速发送预设命令
- 命令历史记录
- 支持变量替换和参数化命令

**数据结构**：
```typescript
interface Command {
  id: string;
  name: string;
  data: string;
  format: 'text' | 'hex' | 'binary';
  description?: string;
}
```

### 4. 日志记录模块

**功能描述**：
- 实时显示收发数据
- 时间戳标记
- 发送/接收数据区分（不同颜色）
- 日志导出（TXT, CSV, JSON）
- 日志清空和过滤功能
- 最大日志条数限制（防止内存溢出）

**日志格式**：
```typescript
interface LogEntry {
  timestamp: number;
  direction: 'send' | 'receive';
  data: Uint8Array;
  format: 'text' | 'hex' | 'binary';
  displayText: string;
}
```

### 5. 脚本支持模块

**功能描述**：
- 简单的脚本语言支持
- 延时命令（DELAY）
- 循环发送（LOOP）
- 条件判断（基于接收数据）
- 脚本保存和加载

**脚本示例**：
```
SEND "AT\r\n"
DELAY 1000
SEND "AT+GMR\r\n"
DELAY 1000
LOOP 5
  SEND "PING\r\n"
  DELAY 500
END
```

### 6. 多串口支持模块

**功能描述**：
- 同时连接多个串口设备
- 标签页切换不同串口
- 独立的配置和日志
- 串口状态监控

**实现要点**：
- 使用数组管理多个 SerialPort 实例
- 每个串口独立的读写流
- 全局串口列表管理

## 项目结构

```
vercel-serial-tool/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 主页面
│   └── globals.css             # 全局样式
├── components/
│   ├── SerialConfig.tsx        # 串口配置组件
│   ├── DataTransfer.tsx        # 数据传输组件
│   ├── CommandPanel.tsx        # 命令面板组件
│   ├── LogViewer.tsx           # 日志查看器组件
│   ├── ScriptEditor.tsx        # 脚本编辑器组件
│   └── SerialTabs.tsx          # 多串口标签组件
├── hooks/
│   ├── useSerialPort.ts        # 串口操作 Hook
│   ├── useSerialLog.ts         # 日志管理 Hook
│   └── useScriptRunner.ts      # 脚本执行 Hook
├── lib/
│   ├── serialUtils.ts          # 串口工具函数
│   ├── dataConverter.ts        # 数据格式转换
│   └── scriptParser.ts         # 脚本解析器
├── types/
│   └── serial.ts               # TypeScript 类型定义
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 关键实现细节

### Web Serial API 使用

```typescript
// 请求串口访问
const port = await navigator.serial.requestPort();

// 打开串口
await port.open({
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
});

// 读取数据
const reader = port.readable.getReader();
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  // 处理接收到的数据
}

// 写入数据
const writer = port.writable.getWriter();
await writer.write(new Uint8Array([0x01, 0x02, 0x03]));
writer.releaseLock();
```

### 数据格式转换

```typescript
// 文本转字节
function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

// 字节转文本
function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

// HEX 字符串转字节
function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/\s/g, '');
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
  }
  return bytes;
}

// 字节转 HEX 字符串
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ');
}
```

### 本地存储

使用 localStorage 保存：
- 串口配置历史
- 自定义命令列表
- 脚本文件
- 用户偏好设置

```typescript
// 保存配置
localStorage.setItem('serialConfig', JSON.stringify(config));

// 读取配置
const config = JSON.parse(localStorage.getItem('serialConfig') || '{}');
```

## 浏览器兼容性

Web Serial API 支持情况：
- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Opera 75+
- ❌ Firefox（需要启用实验性功能）
- ❌ Safari（不支持）

**注意事项**：
- 必须在 HTTPS 环境下使用（localhost 除外）
- 需要用户手动授权串口访问
- Vercel 默认提供 HTTPS

## 部署配置

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 静态导出
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

## 安全考虑

1. **用户授权**：每次访问串口都需要用户明确授权
2. **数据验证**：对用户输入的命令和脚本进行验证
3. **错误处理**：完善的异常捕获和错误提示
4. **资源清理**：组件卸载时正确关闭串口连接

## 性能优化

1. **虚拟滚动**：日志显示使用虚拟列表，避免 DOM 节点过多
2. **数据限制**：限制日志最大条数（如 1000 条）
3. **防抖节流**：高频数据接收时使用节流处理
4. **Web Worker**：复杂的数据处理放在 Worker 中执行

## 用户体验优化

1. **响应式设计**：适配桌面和平板设备
2. **快捷键支持**：常用操作提供快捷键
3. **主题切换**：支持亮色/暗色主题
4. **状态指示**：清晰的连接状态和数据传输指示
5. **错误提示**：友好的错误信息和解决建议

## 开发步骤

1. **初始化项目**：创建 Next.js 项目并配置 TypeScript 和 Tailwind CSS
2. **实现基础串口连接**：封装 Web Serial API 基础功能
3. **开发 UI 组件**：实现各功能模块的界面组件
4. **集成功能模块**：将各模块整合到主应用中
5. **测试调试**：使用真实串口设备进行测试
6. **优化部署**：配置 Vercel 部署并进行性能优化

## 测试建议

1. **单元测试**：测试数据转换、脚本解析等工具函数
2. **集成测试**：测试串口连接、数据收发流程
3. **设备测试**：使用多种串口设备（Arduino、ESP32 等）测试兼容性
4. **浏览器测试**：在不同浏览器中测试功能可用性

## 扩展功能建议

1. **数据可视化**：图表显示串口数据趋势
2. **协议解析**：支持常见协议（Modbus、AT 命令等）自动解析
3. **文件传输**：支持通过串口传输文件（XMODEM、YMODEM）
4. **远程协作**：多用户共享串口调试会话
5. **插件系统**：允许用户自定义扩展功能

## 参考资源

- [Web Serial API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 部署指南](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
