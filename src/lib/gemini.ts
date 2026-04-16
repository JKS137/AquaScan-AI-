import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface WaterAnalysisResult {
  contaminationLevel: 'safe' | 'moderate' | 'unsafe';
  confidence: number;
  detections: string[];
  healthRisk: string;
  recommendation: string;
  explanation: string;
}

export async function analyzeWaterQuality(base64Image: string): Promise<WaterAnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this image of a water sample. 
  Classify its contamination level based on appearance:
  - 🟢 Safe: Clear, no particles, no discoloration, no algae.
  - 🟡 Moderate: Slight discoloration (yellow/brown/green), minor particles/sediment.
  - 🔴 Unsafe: Dark/cloudy, strong discoloration, visible debris, algae, or oil.
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          contaminationLevel: { type: Type.STRING, enum: ['safe', 'moderate', 'unsafe'] },
          confidence: { type: Type.NUMBER },
          detections: { type: Type.ARRAY, items: { type: Type.STRING } },
          healthRisk: { type: Type.STRING },
          recommendation: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ['contaminationLevel', 'confidence', 'detections', 'healthRisk', 'recommendation', 'explanation']
      }
    }
  });

  try {
    return JSON.parse(response.text.trim()) as WaterAnalysisResult;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not analyze image. Please try again.");
  }
}
