
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// Use import.meta.env for Vite compatibility
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function translateText(text: string, from: Language, to: Language): Promise<string> {
  if (!text || from === to) return text;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following text from ${from} to ${to}. Preserve the tone and meaning accurately. Do not include any meta-talk, just the translation.\n\nText: ${text}`,
    });
    // .text is a property, not a method.
    return response.text || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function summarizeThread(content: string, replies: string[]): Promise<string> {
  try {
    const threadData = `Main Post: ${content}\n\nReplies:\n${replies.join('\n')}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this forum thread in 2-3 concise sentences for a parent community. Focus on the main sentiment and key points discussed.\n\nThread:\n${threadData}`,
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Summarization error:", error);
    return "Summary generation failed.";
  }
}

export async function detectLanguage(text: string): Promise<Language> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Detect the language of the following text. Respond with ONLY "EN" or "FR". If it's another language, choose the closest one or "EN".\n\nText: ${text}`,
    });
    const detected = response.text?.trim().toUpperCase();
    return detected === 'FR' ? Language.FR : Language.EN;
  } catch (error) {
    return Language.EN;
  }
}
