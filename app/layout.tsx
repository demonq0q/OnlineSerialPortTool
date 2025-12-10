import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '在线串口工具',
  description: '基于 Web Serial API 的在线串口调试工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
