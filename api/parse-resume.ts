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

    const prompt = `You are an expert ATS data extractor.
Extract the candidate's resume details from the provided document perfectly.
You MUST extract ALL work experience and ALL education history. Do not skip or summarize any entries.

CRITICAL INSTRUCTIONS FOR EXPERIENCE & EDUCATION:
- "title": Job title or Degree name.
- "subtitle": Company name or School name (include location if available).
- "period": Date range.
- "description": Combine all bullet points, responsibilities, and achievements into a single string. Use bullet points (•) and line breaks (\\n) within the string. DO NOT leave this empty!

IMPORTANT FOR SKILLS: 
Group related skills together intelligently into domains (e.g., "Data: Python, SQL", "Languages: English, Mandarin"). 

IMPORTANT FOR CONTACT ITEMS:
Extract all URLs, websites, LinkedIn, GitHub, emails, and phone numbers.
For emails, set url to "mailto:example@domain.com". 
For phones, set url to "tel:+123456789".

OUTPUT FORMAT:
Ensure the final output strictly adheres to this JSON structure:
{
  "profile": {
    "name": "Full Name",
    "title": "Professional Title",
    "location": "City, Country",
    "email": "email@example.com",
    "summary": "Full professional summary. Do not leave empty!"
  },
  "contactItems": [
    {
      "icon": "Linkedin",
      "text": "Joe Chou",
      "url": "https://linkedin.com/in/..."
    }
  ],
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [ "Category: Skill1, Skill2", "Category: Skill3" ]
}

WARNING: NEVER place contactItems, experience, or raw JSON keys inside the skills array.
Return ONLY the JSON matching the required schema. Do not hallucinate data. Be very thorough.`;

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
            contactItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  icon: { type: Type.STRING, description: "One of: Mail, Phone, Globe, Linkedin, Github, Twitter" },
                  text: { type: Type.STRING, description: "Display text, e.g., email address, phone number, or handle" },
                  url: { type: Type.STRING, description: "The actual URL or mailto:/tel: link. If it's an email, prefix with mailto:. If it's a phone, prefix with tel:" }
                }
              }
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
