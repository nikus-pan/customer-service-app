import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '智慧客服系統 | Customer Service AI',
  description: '專業、快速、溫暖的 AI 客服體驗',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
