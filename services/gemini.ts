
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Language } from "../types";

// Use import.meta.env for Vite compatibility
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function translateText(text: string, from: Language, to: Language): Promise<string> {
  if (!text || from === to) return text;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Translate the following text from ${from} to ${to}. Preserve the tone and meaning accurately. Return ONLY the translation, no explanations or meta-talk.\n\nText: ${text}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function summarizeThread(content: string, replies: string[]): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const threadData = `Main Post: ${content}\n\nReplies:\n${replies.join('\n')}`;
    const prompt = `Summarize this forum thread in 2-3 concise sentences for a parent community. Focus on the main sentiment and key points discussed.\n\nThread:\n${threadData}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || "Summary unavailable.";
  } catch (error) {
    console.error("Summarization error:", error);
    return "Summary generation failed.";
  }
}

export async function detectLanguage(text: string): Promise<Language> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Detect the language of the following text. Respond with ONLY "EN" or "FR". If it's another language, choose the closest one or "EN".\n\nText: ${text}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const detected = response.text()?.trim().toUpperCase();
    return detected === 'FR' ? Language.FR : Language.EN;
  } catch (error) {
    console.error("Language detection error:", error);
    return Language.EN;
  }
}
