import { GoogleGenAI, Type } from "@google/genai";
import { getSkillNames } from "../lib/skillCache.ts";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Gemini API Key is falsy, please check the env file.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export async function identifySkillNames(taskTitle: string): Promise<string[]> {
  const skillNames = getSkillNames();
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: `Given this software development tsk, identify which of the following skill(s) are required: ${skillNames.join(", ")}. Task: ${taskTitle}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING, enum: skillNames },
          }
        },
        required: ["skills"]
      }
    }
  })

  const parsed = JSON.parse(response.text ?? "{}");
  return parsed.skills ?? [];
}