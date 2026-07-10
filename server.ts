import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Initialize Gemini AI client
  // Using the API key from environment variables
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API route for chat / AI assistant
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const response = await ai.models.generateContent({
        model: "gemma-4-31b-it",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a helpful AI Career Coach powered by Gemma.",
        },
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API route for Resume Review
  app.post("/api/review-resume", async (req, res) => {
    try {
      const { resumeText, targetRole } = req.body;
      const prompt = `Please review this resume for the role of ${targetRole}. Provide an ATS score out of 100, identify skill gaps, and give actionable suggestions for optimization.\n\nResume:\n${resumeText}`;
      const response = await ai.models.generateContent({
        model: "gemma-4-e4b-it",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert ATS and Resume Reviewer AI.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              score: { type: "INTEGER", description: "ATS Score out of 100" },
              feedback: { type: "STRING", description: "General feedback and suggestions" },
              skillGaps: { type: "ARRAY", items: { type: "STRING" }, description: "Missing skills for the role" },
              optimizations: { type: "ARRAY", items: { type: "STRING" }, description: "Actionable optimizations" }
            },
            required: ["score", "feedback", "skillGaps", "optimizations"]
          }
        },
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API route for generating interview questions
  app.post("/api/interview", async (req, res) => {
    try {
      const { role, type } = req.body;
      const prompt = `Generate 3 realistic ${type} interview questions for a ${role} position.`;
      const response = await ai.models.generateContent({
        model: "gemma-4-26b-a4b-it",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert technical and HR interviewer.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              questions: { 
                type: "ARRAY", 
                items: { 
                  type: "OBJECT",
                  properties: {
                    question: { type: "STRING" },
                    expectedKeyPoints: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ["question", "expectedKeyPoints"]
                }
              }
            },
            required: ["questions"]
          }
        },
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
