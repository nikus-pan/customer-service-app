import path from 'path';
import fs from 'fs';

export interface SOPResult {
  title: string;
  content: string;
  filename: string;
  score: number;
}

export interface SOPDocument {
  title: string;
  content: string;
  keywords: string[];
  filename: string;
}

let sopDocuments: SOPDocument[] = [];

export function loadSOPDocuments(): void {
  const sopDir = path.join(process.cwd(), 'data/sop');
  
  if (!fs.existsSync(sopDir)) {
    fs.mkdirSync(sopDir, { recursive: true });
    createSampleSOP(sopDir);
  }

  const files = fs.readdirSync(sopDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));
  
  sopDocuments = files.map(file => {
    const content = fs.readFileSync(path.join(sopDir, file), 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const title = lines[0]?.replace(/^#+ /, '').trim() || file;
    const keywords = extractKeywords(content);
    
    return {
      title,
      content: content,
      keywords,
      filename: file
    };
  });

  console.log(`Loaded ${sopDocuments.length} SOP documents`);
}

function createSampleSOP(sopDir: string): void {
  const sampleContent = `# 產品問題 FAQ

## 產品無法開機
1. 檢查電源線是否正確連接
2. 確認電源插座有電
3. 長按電源鍵 10 秒進行重置
4. 如仍無法開機，請聯繫客服

## 產品有異味
1. 立即停止使用產品
2. 檢查產品周圍是否有異物
3. 確保通風口未被堵塞
4. 聯繫客服安排檢修

## 產品發熱
1. 這是正常現象，使用時會產生熱量
2. 確保產品放置在通風良好的環境
3. 避免長時間連續使用
4. 如溫度異常過高，請聯繫客服

## 產品無法連線
1. 檢查網路連線是否正常
2. 重新啟動產品
3. 確認 WiFi 密碼正確
4. 檢查產品是否在支援範圍內

# 訂購與付款

## 如何訂購產品
1. 瀏覽產品目錄，選擇想要購買的產品
2. 點擊「加入購物車」
3. 前往購物車結帳
4. 選擇配送方式與付款方式
5. 確認訂單並完成付款

## 付款方式
- 信用卡（VISA、MasterCard、JCB）
- LINE Pay
- 銀行轉帳
- 貨到付款

## 運費說明
- 訂單滿 999 元免運費
- 未達免運標準，運費 100 元
- 偏遠地區可能另有運費

## 配送時間
- 一般商品：3-5 個工作天
- 預購商品：依商品頁面說明
- 急件服務：可聯繫客服安排

# 退換貨政策

## 退貨須知
1. 商品收到後 7 天內可申請退貨
2. 商品須保持全新狀態
3. 請保留完整包裝與配件
4. 退貨運費由客戶自行負擔

## 換貨須知
1. 商品收到後 14 天內可申請換貨
2. 換貨原因為商品瑕疵時，運費由我們負擔
3. 請透過客服管道申請換貨

## 退款處理
1. 退貨商品確認收回後，7 個工作天內完成退款
2. 退款將退回原付款帳戶
3. 優惠券恕不退還

# 會員服務

## 會員等級
- 免費會員：註冊即可享受基本服務
- VIP 會員：消費滿 10000 元升級，享 9 折優惠
- 企業會員：專屬客服，享 8 折優惠

## 會員優惠
- 生日禮物
- 專屬折扣
- 優先預購權
- 免費升級服務

## 密碼重設
1. 點擊登入頁面的「忘記密碼」
2. 輸入註冊 Email
3. 系統會發送重設連結至您的信箱
4. 點擊連結設定新密碼

# 技術支援

## 產品保固
- 一般產品：1 年保固
- VIP 會員產品：2 年保固
- 企業會員產品：3 年保固

## 保固範圍
- 產品硬體故障（非人為損壞）
- 產品功能異常

## 保固不包含
- 人為損壞
- 意外造成的損壞
- 自然耗損
- 未依說明書操作

## 維修服務
1. 聯繫客服申請維修
2. 客服會安排物流取件
3. 維修完成後寄回
4. 維修期間提供備用機（僅 VIP/企業會員）

# 聯繫客服

## 客服管道
- 電話：02-1234-5678（週一至週五 09:00-18:00）
- Email：support@example.com
- LINE@：@example
- 線上客服：24/7 AI 客服

## 服務時間
- AI 客服：24 小時
- 人工客服：週一至週五 09:00-18:00
- 國定假日休息
`;

  fs.writeFileSync(path.join(sopDir, 'sample-sop.txt'), sampleContent);
  console.log('Created sample SOP file');
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[#\n\r，。、？！""''（）【】《》]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1);
  
  const wordCount: Record<string, number> = {};
  words.forEach(w => {
    wordCount[w] = (wordCount[w] || 0) + 1;
  });

  const keywords = Object.entries(wordCount)
    .filter(([w]) => w.length > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([w]) => w);

  return keywords;
}

export function searchSOP(query: string): SOPResult[] {
  if (sopDocuments.length === 0) {
    loadSOPDocuments();
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);

  const results: SOPResult[] = sopDocuments.map(doc => {
    let score = 0;
    const contentLower = doc.content.toLowerCase();

    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 10;
      }
      doc.keywords.forEach(keyword => {
        if (keyword.includes(word) || word.includes(keyword)) {
          score += 5;
        }
      });
    });

    if (queryLower.includes(doc.title.toLowerCase())) {
      score += 20;
    }

    return {
      title: doc.title,
      content: doc.content,
      filename: doc.filename,
      score
    };
  });

  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

loadSOPDocuments();

export default { searchSOP, loadSOPDocuments };
