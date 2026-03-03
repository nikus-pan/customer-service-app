# 智慧客服系統 (Customer Service AI Portal)

結合公司介紹與 AI 客服的雙區塊網頁系統。

## 功能特色

- **左右分欄設計**：左側公司介紹與產品，右側 AI 對話介面
- **類似 Gemini 的 AI 對話**：智慧問答，支援 Markdown
- **RAG 功能**：基於 SOP 文件的智能搜尋
- **認證系統**：Email/密碼登入 + 匿名諮詢
- **對話歷史**：會員可查看過往對話
- **產品展示**：互動式產品目錄

## 快速開始

### 前置需求

- Node.js 18+

### 安裝

```bash
cd customer-service-app/frontend
npm install
```

### 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env`:
```
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### 啟動開發伺服器

```bash
npm run dev
```

開啟 http://localhost:3000

## API 金鑰取得

### Gemini API Key

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 建立新的 API Key
3. 將金鑰加入 `.env`

## 部署至 Vercel

```bash
npm run build
vercel deploy
```

或連接 GitHub 倉庫進行自動部署。

## 重要提醒

⚠️ **SQLite 資料庫限制**：本專案使用 SQLite，在 Vercel 伺服器環境中無法持久儲存資料。生產環境建議替換為 PostgreSQL 或 MySQL。

## 技術選型

| 層面 | 技術 |
|------|------|
| 框架 | Next.js 14 |
| UI | React + Tailwind CSS |
| 資料庫 | SQLite (開發用) |
| AI | Google Gemini API |
| RAG | 自建文字檔案 + 關鍵字搜尋 |

## License

MIT
