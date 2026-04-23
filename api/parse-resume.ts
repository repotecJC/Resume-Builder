import { GoogleGenAI, Type } from "@google/genai";

// Vercel serverless function configuration
// We set a 4MB limit here to ensure that Base64 payloads don't exceed Vercel's 4.5MB hard limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', 
    },
  },
};

export default async function handler(req: any, res: any) {
  // Prevent any non-POST methods immediately
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { fileType, base64Data } = req.body;

    if (!base64Data || !fileType) {
      return res.status(400).json({ error: "Missing fileData or fileType" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isPlaceholderKey = !apiKey || apiKey.includes(' ') || apiKey.length < 20;

    if (isPlaceholderKey) {
      // Return 412 so the frontend knows there's no real Vercel key configured
      return res.status(412).json({ error: "NO_SERVER_KEY" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert HR system.
Extract the person's resume details from the provided document perfectly.
Structure the text correctly and return ONLY the JSON matching the required schema.
Ensure all names, titles, locations, emails, and summaries are accurate.
If a section isn't found, leave the array empty or the string null. 
Do not hallucinate data.

IMPORTANT FOR SKILLS: 
Group related skills together intelligently into categories based on ecosystems or domains.
Look for programming languages, frameworks, AI tools, etc., and group them logically.
Format each skill entry STRICTLY as "Category: Skill1, Skill2, Skill3".
For example: "Python: Django, Flask, OpenCV" or "Frontend: React, TypeScript, Tailwind".
Do not just output single disconnected skills if they can be categorized.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: fileType } }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            profile: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                location: { type: Type.STRING },
                email: { type: Type.STRING },
                summary: { type: Type.STRING },
              },
              required: ["name"],
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  period: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  period: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const jsonStr = result.text?.trim();
    if (!jsonStr) throw new Error("Empty response from AI");

    const parsedResult = JSON.parse(jsonStr);
    res.status(200).json(parsedResult);
  } catch (error: any) {
    console.error("Vercel Secure API Parse Error:", error);
    res.status(500).json({ error: "Failed to parse resume on Vercel backend", details: error.message });
  }
}
