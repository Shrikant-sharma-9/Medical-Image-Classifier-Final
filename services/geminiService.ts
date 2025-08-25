
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    diagnoses: {
      type: Type.ARRAY,
      description: "A list of possible medical conditions with their corresponding probabilities.",
      items: {
        type: Type.OBJECT,
        properties: {
          condition: {
            type: Type.STRING,
            description: "The name of the medical condition (e.g., 'Pneumonia', 'Normal', 'Effusion')."
          },
          probability: {
            type: Type.NUMBER,
            description: "The probability of this condition, from 0.0 to 1.0."
          }
        },
        required: ["condition", "probability"]
      }
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed but concise explanation of the findings, written for a medical professional."
    },
    attentionArea: {
      type: Type.OBJECT,
      description: "The primary area of interest or concern in the image.",
      properties: {
        x: {
          type: Type.NUMBER,
          description: "The x-coordinate of the top-left corner of the bounding box, as a percentage of image width."
        },
        y: {
          type: Type.NUMBER,
          description: "The y-coordinate of the top-left corner of the bounding box, as a percentage of image height."
        },
        width: {
          type: Type.NUMBER,
          description: "The width of the bounding box, as a percentage of image width."
        },
        height: {
          type: Type.NUMBER,
          description: "The height of the bounding box, as a percentage of image height."
        },
        description: {
          type: Type.STRING,
          description: "A brief description of what is significant about this area."
        }
      },
      required: ["x", "y", "width", "height", "description"]
    }
  },
  required: ["diagnoses", "explanation", "attentionArea"]
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const prompt = `
    Analyze the provided chest X-ray image as an expert radiologist.
    Provide a list of potential diagnoses with probabilities, a detailed explanation of your findings, and identify the most critical area of attention with a bounding box.
    The sum of probabilities in the diagnoses list should be close to 1.0.
    If the image is not a medical X-ray, respond with an appropriate error in the explanation field.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);

    // Validate structure (simple validation)
    if (!parsedResult.diagnoses || !parsedResult.explanation || !parsedResult.attentionArea) {
      throw new Error("Invalid response structure from API.");
    }

    return parsedResult as AnalysisResult;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to get a valid analysis from the AI model. The image might be unsupported or an API error occurred.");
  }
};
