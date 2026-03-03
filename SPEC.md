# 客服系統規格文件 (SPEC.md)

## 1. 專案概述

### 專案名稱
Customer Service AI Portal

### 專案類型
網頁版客服系統 (Web Application)

### 核心功能摘要
結合公司介紹與 AI 客服的雙區塊網頁，左側為公司介紹與產品展示，右側為類似 Google Gemini 的 AI 對話介面，具備 RAG 功能、認證系統、對話歷史記錄。

### 目標用戶
- 潛在客戶：了解公司與產品
- 現有客戶：尋求產品問題解答
- 會員：個人化服務與歷史記錄

---

## 2. UI/UX 規格

### 2.1 版面配置

**整體佈局**
- 類型：左右分欄式設計
- 左側寬度：40%（公司介紹）
- 右側寬度：60%（AI 對話）
- 響應式：手機模式下轉為上下堆疊

**Header**
- Logo（左側）
- 導航選單（公司首頁、產品介紹、客服中心）
- 登入/註冊按鈕（右側）

### 2.2 左側：公司介紹頁面

**Hero 區塊**
- 公司名稱與標語
- 簡短公司描述
- CTA 按鈕：「開始諮詢」

**關於我們區塊**
- 公司成立時間
- 核心價值：專業、快速、關心、溫暖

**產品展示區塊**
- 產品卡片式展示
- 每個產品包含：名稱、圖片、簡短描述、價格
- 點擊查看詳情

### 2.3 右側：AI 對話介面

**類似 Google Gemini 的設計**
- 深色主題背景
- 頂部：對話標題與設定
- 主區域：對話訊息流
- 輸入區：文字輸入框 + 發送按鈕
- 支援 Markdown 渲染
- 訊息時間戳記

**對話功能**
- 輸入框支援多行文字
- 發送按鈕（紙飛機圖示）
- 清除對話按鈕
- 對話歷史折疊/展開

### 2.4 設計系統

**色彩**
- 主色：#2563EB (藍色)
- 次色：#1E40AF (深藍)
- 強調色：#10B981 (綠色 - 成功狀態)
- 背景色：#0F172A (深色 - 對話區)
- 淺色背景：#F8FAFC
- 文字色：#1E293B (深灰)
- 副文字：#64748B

**字體**
- 主字體：Inter, system-ui, sans-serif
- 代碼/對話：JetBrains Mono, monospace

**間距**
- 基礎單位：4px
- 區塊間距：24px
- 卡片內距：16px
- 按鈕內距：12px 24px

**動效**
- 按鈕 hover：scale(1.02), 150ms
- 對話訊息：fadeIn, 200ms
- 載入中：pulse 動畫
- 轉場：300ms ease-out

### 2.5 元件清單

**按鈕**
- Primary：藍色背景，白色文字
- Secondary：白色背景，藍色邊框
- Ghost：透明背景，文字色

**輸入框**
- 圓角：12px
- 邊框：1px solid #E2E8F0
- Focus：2px solid #2563EB

**卡片**
- 背景：白色
- 圓角：16px
- 陰影：0 4px 6px -1px rgba(0,0,0,0.1)

**對話氣泡**
- User：右側對齊，藍色背景
- AI：左側對齊，深灰色背景
- 圓角：16px（倒角一側）

---

## 3. 功能規格

### 3.1 認證系統

**功能**
- Email/密碼註冊與登入
- 匿名諮詢（無需登入）
- 登出功能
- 密碼雜湊儲存（bcrypt）

**會員資料**
```typescript
{
  id: string
  email: string
  password: string (hashed)
  name: string
  createdAt: timestamp
  role: 'guest' | 'free' | 'premium'
}
```

### 3.2 RAG 文字檔案搜尋系統

**SOP 文件管理**
- 文件儲存：data/sop/*.txt
- 支援格式：.txt, .md
- 關鍵字搜尋引擎

**搜尋流程**
1. 使用者輸入問題
2. 提取關鍵字
3. 搜尋 SOP 文件
4. 回傳相關內容
5. 結合上下文生成回答

**SOP 文件範例**
```
# 產品問題 FAQ
## 產品無法開機
1. 檢查電源線是否連接
2. 長按電源鍵 10 秒
3. 聯繫客服

## 產品有異味
1. 立即停止使用
2. 檢查是否有異物
3. 聯繫客服
```

### 3.3 AI 對話功能

**對話流程**
1. 使用者輸入問題
2. 確認理解（選擇性）
3. RAG 搜尋相關 SOP
4. 呼叫 Gemini API 生成回答
5. 顯示回答
6. 儲存對話記錄

**Gemini 整合**
- 模型：gemini-pro
- 系統提示詞：專業、溫暖、快速
- 上下文：包含 SOP 搜尋結果

**對話歷史**
- 儲存所有對話記錄
- 會員可查看歷史
- 支援搜尋過往對話
- AI 參考歷史進行個人化回覆

### 3.4 產品查詢與訂購

**產品資料**
```typescript
{
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  features: string[]
}
```

**功能**
- 產品列表展示
- 產品詳情頁
- 加入購物車（MVP 先不做實際購買）
- 相關產品推薦

### 3.5 匿名諮詢

**功能**
- 無需登入即可諮詢
- 體驗 3 次後引導註冊
- 可選擇性註冊保存記錄
- 引導註冊時機：
  - 體驗 3 次後
  - 對話中提及產品

### 3.6 API 端點

**認證**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

**對話**
- POST /api/chat/send
- GET /api/chat/history
- DELETE /api/chat/clear

**產品**
- GET /api/products
- GET /api/products/:id

**SOP**
- GET /api/sop/search?q=關鍵字
- GET /api/sop/all

---

## 4. 技術架構

### 4.1 前端 (Next.js)

**技術堆疊**
- Framework: Next.js 14 (App Router)
- 語言：TypeScript
- UI：Tailwind CSS
- 狀態管理：React Context + useState
- HTTP Client：fetch API

**資料夾結構**
```
frontend/
├── app/
│   ├── page.tsx          # 主頁面（左右分欄）
│   ├── layout.tsx        # 根佈局
│   ├── globals.css       # 全域樣式
│   ├── products/        # 產品頁面
│   ├── chat/            # 對話頁面
│   └── api/             # API 路由（可選）
├── components/
│   ├── Header.tsx
│   ├── CompanyIntro.tsx
│   ├── ProductList.tsx
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   └── AuthModal.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useChat.ts
├── types/
│   └── index.ts
└── lib/
    └── api.ts
```

### 4.2 後端 (Node.js + Express)

**技術堆疊**
- Framework: Express.js
- 語言：TypeScript
- 資料庫：SQLite + better-sqlite3
- 認證：JWT + bcrypt
- AI：Google Gemini API

**資料夾結構**
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── chatController.ts
│   │   ├── productController.ts
│   │   └── sopController.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   └── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── products.ts
│   │   └── sop.ts
│   ├── services/
│   │   ├── geminiService.ts
│   │   ├── ragService.ts
│   │   └── authService.ts
│   ├── utils/
│   │   └── keywordSearch.ts
│   └── index.ts
├── data/
│   ├── sop/              # SOP 文件
│   └── products.json     # 產品資料
├── database.sqlite
└── package.json
```

---

## 5. 驗收標準

### 5.1 功能驗收

- [ ] 網頁左右分欄正常顯示
- [ ] 左側公司介紹與產品列表顯示正確
- [ ] 右側 AI 對話介面類似 Gemini 風格
- [ ] 可以發送訊息並獲得回覆
- [ ] RAG 搜尋能正確找到相關 SOP
- [ ] 可以註冊/登入/登出
- [ ] 匿名諮詢可以正常使用
- [ ] 對話歷史正確儲存與顯示
- [ ] 會員登入後可查看歷史記錄

### 5.2 視覺驗收

- [ ] 色彩符合設計系統
- [ ] 字體正確載入
- [ ] 響應式設計正常運作
- [ ] 動效流暢
- [ ] 深色主題對話區美觀

### 5.3 效能驗收

- [ ] 頁面載入時間 < 3 秒
- [ ] AI 回覆時間 < 5 秒
- [ ] 搜尋回應時間 < 1 秒

---

## 6. 開發時程

| 階段 | 時間 | 主要交付物 |
|------|------|------------|
| 基礎設定 | 1 週 | 專案結構、資料庫、API 骨架 |
| 前端開發 | 2 週 | UI 元件、頁面佈局 |
| 後端 API | 1 週 | 認證、對話、產品 API |
| RAG 整合 | 1 週 | 文字搜尋、Gemini 整合 |
| 測試優化 | 1 週 | Bug 修復、效能優化 |
| **總計** | **6 週** | **MVP 完成** |
