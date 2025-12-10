# 在线串口工具

基于 Web Serial API 的在线串口调试工具，可部署在 Vercel 平台。

## 功能特性

- ✅ **串口配置**: 支持波特率、数据位、停止位、校验位等参数配置
- ✅ **数据传输**: 支持文本和十六进制格式的数据收发
- ✅ **自定义命令**: 保存和快速发送常用命令
- ✅ **日志记录**: 实时显示通信日志，支持导出
- ✅ **脚本支持**: 编写和执行自动化脚本
- ✅ **响应式设计**: 适配桌面和平板设备

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Web Serial API

## 浏览器支持

- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Opera 75+
- ❌ Firefox (需启用实验性功能)
- ❌ Safari (不支持)

**注意**: 必须在 HTTPS 环境下使用（localhost 除外）

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 部署到 Vercel

### 方法 1: 通过 Vercel CLI

```bash
npm install -g vercel
vercel
```

### 方法 2: 通过 GitHub

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 自动部署

### 方法 3: 手动部署

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入 Git 仓库或上传文件
4. 点击 "Deploy"

## 使用说明

### 1. 连接串口

1. 配置串口参数（波特率、数据位等）
2. 点击"连接串口"按钮
3. 在浏览器弹窗中选择串口设备
4. 授权访问

### 2. 发送数据

- **文本模式**: 直接输入文本，可选择换行符类型
- **十六进制模式**: 输入 HEX 格式数据，如 `01 02 03`

### 3. 自定义命令

1. 点击"添加"按钮
2. 输入命令名称和数据
3. 选择数据格式（文本/十六进制）
4. 保存后可快速发送

### 4. 脚本编写

支持的命令：

```
SEND "数据"      # 发送数据
DELAY 1000       # 延时 1000 毫秒
LOOP 5           # 循环 5 次
  SEND "test"
  DELAY 500
END              # 结束循环
# 这是注释
```

示例脚本：

```
# AT 命令测试
SEND "AT\r\n"
DELAY 1000
SEND "AT+GMR\r\n"
DELAY 1000

# 循环发送
LOOP 10
  SEND "PING\r\n"
  DELAY 500
END
```

### 5. 日志管理

- 实时显示收发数据
- 切换文本/HEX 显示格式
- 导出日志到文件
- 清空日志

## 项目结构

```
vercel-serial-tool/
├── app/                    # Next.js 应用目录
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── SerialConfig.tsx   # 串口配置
│   ├── DataTransfer.tsx   # 数据传输
│   ├── CommandPanel.tsx   # 命令面板
│   ├── LogViewer.tsx      # 日志查看器
│   └── ScriptEditor.tsx   # 脚本编辑器
├── hooks/                 # 自定义 Hooks
│   ├── useSerialPort.ts   # 串口操作
│   └── useScriptRunner.ts # 脚本执行
├── lib/                   # 工具函数
│   ├── serialUtils.ts     # 串口工具
│   ├── dataConverter.ts   # 数据转换
│   ├── scriptParser.ts    # 脚本解析
│   └── storage.ts         # 本地存储
└── types/                 # TypeScript 类型
    └── serial.ts
```

## 常见问题

### Q: 为什么无法连接串口？

A: 请确保：
- 使用支持的浏览器（Chrome/Edge）
- 在 HTTPS 环境下访问
- 串口设备已正确连接
- 没有其他程序占用串口

### Q: 如何在本地测试？

A: 使用 `npm run dev` 启动开发服务器，localhost 不需要 HTTPS。

### Q: 数据显示乱码怎么办？

A: 检查串口配置参数是否正确，特别是波特率和数据位。

### Q: 可以同时连接多个串口吗？

A: 当前版本支持单个串口连接，多串口功能在开发中。

## 安全说明

- 每次访问串口都需要用户明确授权
- 数据仅在本地处理，不会上传到服务器
- 使用 localStorage 保存配置和命令

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请提交 Issue。
