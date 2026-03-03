import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchSOP } from './rag';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `你是一個專業、溫暖又快速的客服 AI 助手。

你的風格：
- 專業：提供準確、有用的資訊
- 溫暖：使用友善的語氣，讓客戶感到被關心
- 快速：簡潔明瞭地回答問題

當你不確定答案時，請坦誠說「我不知道」，並建議客戶聯繫人工客服。

你可以根據客戶的問題，推薦相關產品。`;

export async function generateChatResponse(
  userMessage: string,
  history: { role: string; content: string }[]
): Promise<string> {
  try {
    const sopResults = searchSOP(userMessage);
    
    let context = '';
    if (sopResults.length > 0) {
      context = '\n\n以下是相關的客服 SOP 文件：\n';
      sopResults.forEach((result, index) => {
        context += `\n[${index + 1}] ${result.title}\n${result.content}\n`;
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = SYSTEM_PROMPT;
    
    if (context) {
      prompt += context;
    }

    prompt += `\n\n客戶問題：${userMessage}\n\n請用中文回答：`;    

    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    const sopResults = searchSOP(userMessage);
    if (sopResults.length > 0) {
      return `根據我們的資料庫，以下資訊可能對您有幫助：\n\n${sopResults[0].content}`;
    }
    
    return '抱歉，目前服務有些問題。請稍後再試，或聯繫我們的人工客服。';
  }
}

export default { generateChatResponse };
