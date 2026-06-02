import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Gemini Setup
  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (!geminiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
  }

  const ai = new GoogleGenAI({
    apiKey: geminiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  
  // API Routes
  
  // IP/Language Detection
  app.get("/api/geo", (req, res) => {
    const acceptLang = req.headers["accept-language"] || "";
    const isEn = acceptLang.toLowerCase().includes("en") && !acceptLang.toLowerCase().includes("ja");
    const country = req.headers["x-appengine-country"] || req.headers["cf-ipcountry"] || "UNKNOWN";
    
    res.json({
      language: isEn ? "en" : "ja",
      country,
      detectedFrom: "headers"
    });
  });

  // Gemini Proxies
  app.post("/api/oracle", async (req, res) => {
    try {
      const { userMessage, history, userSummary, language, systemInstruction, stream: shouldStream } = req.body;
      const languagePrompt = language === 'en' ? "Please respond in English." : "日本語で応対してください。";
      
      const contents = [
        { role: 'user', parts: [{ text: `ユーザーの背景要約: ${userSummary || '初対面です。'}\n${languagePrompt}` }] },
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      if (shouldStream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const resultStream = await ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.8,
          }
        });

        for await (const chunk of resultStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } else {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.8,
          }
        });
        res.json({ text: result.text });
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Oracle connection lost in the void." });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Stream interrupted." })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/interpret", async (req, res) => {
    try {
      const { prompt, palmImage, systemInstruction } = req.body;

      let contents: any[];
      if (palmImage) {
        contents = [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: palmImage.split(',')[1] || palmImage } },
              { text: prompt }
            ]
          }
        ];
      } else {
        contents = [{ role: "user", parts: [{ text: prompt }] }];
      }

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: result.text });
    } catch (error: any) {
      console.error("Gemini Interpret Error:", error);
      res.status(500).json({ error: error.message || "Interpretation failed in the cosmos." });
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say naturally and clearly in character as a very youthful, higher-pitched ethereal girl oracle: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: error.message || "Voice lost in the ether." });
    }
  });

  app.post("/api/palm-lines", async (req, res) => {
    try {
      const { palmImage } = req.body;
      if (!palmImage) return res.status(400).json({ error: "No image provided" });

      const prompt = `
        You are an advanced, high-precision palmistry computer vision engine.
        Analyze the provided palm image:
        1. Scan the image to identify if it is a Left or Right hand (palm facing the camera).
           - LEFT Hand: The thumb is on the RIGHT side of the image (pointing rightwards), index finger is next to it, and the pinky is on the LEFT side of the image.
           - RIGHT Hand: The thumb is on the LEFT side of the image (pointing leftwards), index finger is next to it, and the pinky is on the RIGHT side of the image.
           Return either "left" or "right" in the "handType" field.
        2. Assign a confidence value between 0.0 and 1.0 depending on the clarity of the palm in the image.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: palmImage.split(',')[1] || palmImage } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              handType: {
                type: Type.STRING,
                description: "Must be exactly 'left' or 'right' depending on the detected hand anatomy."
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence value between 0.0 and 1.0 depending on palm clarity."
              }
            },
            required: ["handType", "confidence"]
          },
          temperature: 0.1,
        }
      });

      res.json(JSON.parse(result.text));
    } catch (error: any) {
      console.error("Gemini Line Detection Error:", error);
      res.status(500).json({ error: error.message || "Line detection failed." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
