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

  const prompt = `
  ${palmImage ? (language === 'en' ? 'An image of the user\'s palm has been provided.' : '分析対象の掌の画像が提供されました。') : (hasCards ? (language === 'en' ? `The hidden meanings of the chosen cosmic cards:\n${cardsInfo}` : `選ばれた宇宙オラクルカード of 秘められた意味:\n${cardsInfo}`) : (language === 'en' ? 'This time, reading destiny directly from the Star Map of Life etched on the user\'s palm without cards.' : '今回はカードを用いず、相談者の掌（てのひら）に刻まれた「人生の星図」から運命を読み解きます。'))}

  手相鑑定士「エーテル」として、以下の手順で託宣を授けてください：

  【1. 手相の左右識別と基本性格 / Hand Left/Right Identification & Basic Nature】
  - ${language === 'en' ? 'First, identify whether this is the "Left Hand" or "Right Hand" from the image.' : '画像から、これが「右手」か「左手」かをまず特定してください。'}
  - ${language === 'en' ? 'In palmistry, the Left hand represents "Innate Destiny" (natural talent/potential) and the Right hand represents "Acquired Destiny" (current efforts/present state/future).' : '手相において、左手は「先天運（持って生まれた運命・潜在能力）」、右手は「後天運（これまでの努力・現状・未来）」を象徴します。'}
  - ${language === 'en' ? 'Adjust your reading angle based on this (e.g., Left: "The qualities naturally woven into your soul are...", Right: "The current path you have actively forged is...").' : 'どちらの手であるかに基づき、鑑定の切り口を調整してください（例：左手なら「あなたの魂に刻まれた本来の資質は〜」、右手なら「あなたが切り拓いてきた今の運勢は〜」）。'}

  【2. 主要な線の精査（視覚的鑑定）/ Visual Examination of Major Lines】
  - ${language === 'en' ? 'Specifically point out the state of the actual visual lines visible in the image (Life Line, Head Line, Heart Line, Fate Line).' : '画像に見える実際の線（生命線、知能線、感情線、運命線など）の状態を具体的に指摘してください。'}
  - ${language === 'en' ? 'Provide concrete aesthetic and visual descriptions of their shape (e.g., "Your Heart Line gracefully curves upward toward the index finger, showing your pure pursuit of ideals...").' : '「感情線が人差し指の方へ長く伸び、純粋な理想を追い求めている様子が見えます」「知能線が月丘へ向かって急降下しており、豊かな想像力の持ち主であることを示しています」など、具体的な形状に基づいた描写を行ってください。'}

  【3. 宇宙的メッセージと未来への導き / Cosmic Message & Guidance】
  ${promptTemplateContent}

  ${language === 'en' ? 'Respond in English.' : '日本語で出力してください。'}
  神秘的で包容力のある口調で、余白を感じさせる知的な言葉を選んでください。
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

export async function detectPalmLines(palmImage: string): Promise<PalmAnalysis | null> {
  try {
    const response = await fetch('/api/palm-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ palmImage })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return {
      lines: data.lines,
      handType: data.handType,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('Line detection error:', error);
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

export async function reInterpretPalmWithCoordinates(
  userStory: string,
  analysis: PalmAnalysis,
  palmImage?: string | null,
  language: 'ja' | 'en' = 'ja',
  userSummary?: string
) {
  const { handType = 'right', lines } = analysis;
  
  const lineDetails = Object.entries(lines).map(([lineName, points]) => {
    const isVisible = points && points.length > 0;
    const nameLabel = lineName === 'lifeLine' ? (language === 'en' ? 'Life Line' : '生命線 (Life Line)') :
                      lineName === 'headLine' ? (language === 'en' ? 'Head Line' : '知能線 (Head/Brain Line)') :
                      lineName === 'heartLine' ? (language === 'en' ? 'Heart Line' : '感情線 (Heart Line)') :
                      lineName === 'fateLine' ? (language === 'en' ? 'Fate Line' : '運命線 (Fate Line)') : lineName;
                      
    if (!isVisible) {
      if (language === 'en') {
        return `- ${nameLabel}: "Hidden / Not Present" (This indicates this particular trait is less prominent for the user or represents a free, boundaryless current state)`;
      }
      return `- ${nameLabel}: 「非表示/検出なし」（相談者にはこの特性の線が目立たないか、現在枠に縛られない自由な状態であることを意味します）`;
    }
    
    const pointsStr = points.map(pt => `[x:${pt[0]}, y:${pt[1]}]`).join(' -> ');
    if (language === 'en') {
      return `- ${nameLabel}: Active. Coordinates path: ${pointsStr}\n  (This represents the precise crease line manually adjusted by the user to overlay their own palm. Carefully interpret the curve, length, and flow from the beginning to the end of this custom path)`;
    }
    return `- ${nameLabel}: 有効。座標経路: ${pointsStr}\n  （この軌道は相談者が自分の手のひらの位置に合わせて手動調整した正確な手相線です。始点から終点のカーブや角度に宿る意味を深く考察してください）`;
  }).join('\n');

  const promptTemplateContent = INTERPRETATION_PROMPT_TEMPLATE
    .replace('{{language}}', language)
    .replace('{{userStory}}', userStory)
    .replace('{{userSummary}}', userSummary || (language === 'en' ? 'none' : 'なし'));

  const prompt = `
  ${language === 'en'
    ? 'A precise set of geometric coordinates has been provided, manually calibrated by the user to overlay their actual palm creases on the image.'
    : '相談者が自分の掌（てのひら）の画像に合わせて、主要な手相線を「手動で微調整」して確定させた正確な幾何学データが提供されました。'}
  
  ${language === 'en'
    ? 'The entire canvas is scaled to 1000x1333 pixels (3:4 ratio).'
    : '手首や掌全体は1000x1333のキャンバス（3:4比例）に収まっています。'}
  
  【${language === 'en' ? 'Palm Configuration Data' : '手相の構成データ'}】
  - ${language === 'en' ? 'Hand to Read' : '鑑定する手'}: ${handType === 'left' ? (language === 'en' ? 'Left Hand (Innate Destiny: default nature and soul contract)' : '左手（先天運：生まれ持った本質・魂の宿命）') : (language === 'en' ? 'Right Hand (Acquired Destiny: choices you make, present, and future)' : '右手（後天運：あなたが切り拓く現実・未来）')}
  - ${language === 'en' ? 'Manual Calibrations' : '各線のマニュアル調整結果'}：
  ${lineDetails}

  手相鑑定士「エーテル」として、この精密な調整座標データ and 画像をもとに、徹底的な手相鑑定の託宣を授けてください。

  手順：
  【1. ${language === 'en' ? 'Destiny Symbolized by This Hand' : 'この手が象徴する宇宙の宿命'}】
  - ${language === 'en' ? `Speak deeply of what it means to read the ${handType === 'left' ? 'Left hand' : 'Right hand'} under the context of their concerns.` : `${handType === 'left' ? '左手（先天運）' : '右手（後天運）'}であることの意味を、相談者の状況に重ね合わせて語ってください。`}

  【2. ${language === 'en' ? 'Detailed Calibration Reading' : '調整された線（幾何学星図）の個別深層鑑定'}】
  - ${language === 'en' ? "Interpret the specific flow of each calibrated line's coordinate path relative to their concerns." : '相談者が手動でプロットした各手相線の経路（カーブ、長さ、傾きなど）を具体的に解説してください。'}
  - ${language === 'en' ? 'For any hidden/unmapped line, provide a positive, cosmic blessing regarding unbound potential.' : '非表示（オフ）にされた線があれば、その線が描かれていないことの神秘的な意味（枠に縛られない生き方、これから自由に運命を描ける無限の可能性など）を肯定的に語ってください。'}

  【3. ${language === 'en' ? 'Integrated Reading & Earthly Wisdom' : '幾何学が物語る総合託宣と今後のアドバイス'}】
  ${promptTemplateContent}

  神秘的で包容力のある口調、洗練されたエーテル（女性神官/巫女）としての語りで、余白を感じさせる知的な言葉を選んでください。
  ${language === 'en' ? 'Respond in English.' : '日本語で出力してください。'}
  `;

  try {
    const response = await fetch('/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        palmImage: palmImage || undefined,
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
