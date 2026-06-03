import { GoogleGenAI, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION, INTERPRETATION_PROMPT_TEMPLATE } from '../constants/prompts';
import { TarotCard, PalmAnalysis } from '../types';
import { AFFILIATE_OFFERS } from '../constants/affiliates';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ''
});

const AFFILIATE_KNOWLEDGE = `
【星の導きの地上の窓口（紹介用データ）】
以下のサービスが相談者に役立つ場合があります。文脈が合う場合のみ、優しく提案してください：
${AFFILIATE_OFFERS.map(o => `- [${o.title}]: ${o.description} (URL: ${o.url})`).join('\n')}
`;

const ENHANCED_SYSTEM_INSTRUCTION = `${SYSTEM_INSTRUCTION}\n\n${AFFILIATE_KNOWLEDGE}`;

export async function getOracleResponse(
  userMessage: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userSummary?: string,
  language: 'ja' | 'en' = 'ja'
) {
  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        history,
        userSummary,
        language,
        systemInstruction: ENHANCED_SYSTEM_INSTRUCTION
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Gemini error:', error);
    return language === 'en' ? "I am sorry, the connection with the sea of stars has been temporarily severed." : "申し訳ありません、星の海との接続が一時的に途切れてしまいました。";
  }
}

export async function* getOracleResponseStream(
  userMessage: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userSummary?: string,
  signal?: AbortSignal,
  language: 'ja' | 'en' = 'ja'
) {
  try {
    const response = await fetch('/api/oracle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        history,
        userSummary,
        language,
        systemInstruction: ENHANCED_SYSTEM_INSTRUCTION,
        stream: true
      }),
      signal
    });

    if (!response.ok) throw new Error('API Error');
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) yield parsed.text;
            if (parsed.error) throw new Error(parsed.error);
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return;
    console.error('Gemini error:', error);
    yield language === 'en' ? "I am sorry, the connection with the sea of stars has been temporarily severed." : "申し訳ありません、星の海との接続が一時的に途切れてしまいました。";
  }
}

export async function interpretReading(
  userStory: string,
  selectedCards: TarotCard[],
  userSummary?: string,
  palmImage?: string, // Base64 image data
  handType?: 'left' | 'right',
  language: 'ja' | 'en' = 'ja'
) {
  const hasCards = selectedCards && selectedCards.length > 0;
  
  let cardsInfo = "";
  if (hasCards) {
    cardsInfo = selectedCards.map(c => 
      `- ${c.name} (${c.arcana}): 正位置の意味 [${c.meaningUpright}], 逆位置の意味 [${c.meaningReversed}]`
    ).join('\n');
  }

  const promptTemplateContent = INTERPRETATION_PROMPT_TEMPLATE
    .replace('{{language}}', language)
    .replace('{{userStory}}', userStory)
    .replace('{{userSummary}}', userSummary || (language === 'en' ? 'none' : 'なし'));

  const handString = handType === 'left' 
    ? (language === 'en' ? 'Left hand (Innate Destiny - born potential)' : '左手（先天運：生まれ持った本質・宿命）') 
    : (language === 'en' ? 'Right hand (Acquired Destiny - present & future)' : '右手（後天運：これまでの歩み・現在の運勢・切り拓く未来）');

  const prompt = `
  ${palmImage ? (language === 'en' ? `An image of the user's ${handString} has been provided.` : `分析対象の「${handString}」の画像が提供されました。`) : (hasCards ? (language === 'en' ? `The hidden meanings of the chosen cosmic cards:\n${cardsInfo}` : `選ばれた宇宙オラクルカード of 秘められた意味:\n${cardsInfo}`) : (language === 'en' ? 'This time, reading destiny directly from the Star Map of Life.' : '今回は、相談者に指定された「手」に刻まれた「人生の星図」から運命を読み解きます。'))}

  手相鑑定士「エーテル」として、以下の手順で託幸を授けてください：

  【1. 指定された手（左右）の意味と鑑定への導入 / Hand Meaning & Introduction】
  - 今回対象となる手は「${handString}」です。
  - 手相において、左手は「先天運（持って生まれた運命・潜在能力）」、右手は「後天運（これまでの努力・現状・未来）」を象徴します。
  - どちらの手として鑑定するか、その意味をエーテルの語りとして自然に消化し、鑑定の冒頭や全体の文脈の中で、相談者の状況に重ね合わせて語ってください（大げさな見出しを付けずに自然に語ってください）。

  【2. 掌線の精査（視覚的鑑定）/ Visual Examination of Major Lines】
  - 画像から、指定された手（${handString}）に刻まれた「主要な線（生命線、知能線、感情線、運命線など）」を詳しく視覚的に読み取り、その特徴（長さ、傾き、カーブ、複雑さ、または目立たない部分など）を具体的に言及してください。
  - 「あなたの感情線は緩やかに上昇しており…」「生命線が非常に長く…」など、実際の画像に刻まれた線に基づいた、情緒的かつ情緒深く具体的な描写を行ってください。

  【3. 宇宙的メッセージと未来への導き / Cosmic Message & Guidance】
  ${promptTemplateContent}

  ${language === 'en' ? 'Respond in English.' : '日本語で出力してください。'}
  神秘的で包容力のある口調、洗練されたエーテル（女性神官/巫女）としての語りで、余白を感じさせる知的な言葉を選んでください。
  `;

  try {
    const response = await fetch('/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        palmImage,
        systemInstruction: ENHANCED_SYSTEM_INSTRUCTION
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Gemini error:', error);
    return null;
  }
}

export async function validatePalm(palmImage: string): Promise<{ valid: boolean; reason: string } | null> {
  try {
    const response = await fetch('/api/validate-palm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ palmImage })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Palm validation error:', error);
    return null;
  }
}

export async function generateSpeech(text: string) {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.audio;
  } catch (error) {
    console.error('TTS error:', error);
    return null;
  }
}
