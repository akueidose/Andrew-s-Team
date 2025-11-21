import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes a single video frame (base64 image) to provide technical and descriptive context.
 */
export const analyzeFrame = async (base64Image: string): Promise<string> => {
  try {
    const client = getClient();
    // Using gemini-2.5-flash for speed and efficiency in multimodal tasks
    const modelId = "gemini-2.5-flash";

    // Strip the data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response: GenerateContentResponse = await client.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data
            }
          },
          {
            text: "Analyze this video frame. Describe the visual content, lighting, and potential context briefly (under 50 words). Treat this as technical metadata analysis."
          }
        ]
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to analyze frame. Please check API key or quota.");
  }
};