import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

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
    const { prompt, systemInstruction, lowData } = req.body;
    
    // Primary requested model: gemma-4-31b-it
    const primaryModel = "gemma-4-31b-it";
    
    let activeSystemInstruction = systemInstruction || "You are a helpful AI Career Coach powered by the Gemma-4-31b-it model. Use Google Search to find current career trends, job postings, industry updates, and relevant interview guidance.";
    let activeTools: any[] | undefined = [{ googleSearch: {} }];

    if (lowData) {
      // Optimize for slow/low-bandwidth networks by turning off search grounding and enforcing high conciseness
      activeTools = undefined;
      activeSystemInstruction = "You are a helpful AI Career Coach powered by the Gemma-4-31b-it model. [LOW-DATA HIGH-EFFICIENCY MODE ACTIVE]: The user is on a slow or limited network connection. Provide an extremely direct, brief, and concise response using clear bullet points and minimal tokens to minimize latency and save network data. Omit standard introductory/conversational filler.";
    }

    let response;
    let finalModelUsed = primaryModel;

    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: prompt,
        config: {
          systemInstruction: activeSystemInstruction,
          tools: activeTools,
        },
      });
    } catch (error: any) {
      console.warn(`Model ${primaryModel} failed or is not registered in this environment. Falling back to gemini-3.5-flash. Error: ${error.message}`);
      // Fallback model to ensure high availability
      finalModelUsed = "gemini-3.5-flash";
      response = await ai.models.generateContent({
        model: finalModelUsed,
        contents: prompt,
        config: {
          systemInstruction: activeSystemInstruction.replace("Gemma-4-31b-it", "Gemma-4-31b-it (via cloud-assisted fallback)"),
          tools: activeTools,
        },
      });
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks?.map((chunk: any) => ({
      title: chunk.web?.title || chunk.web?.uri,
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    res.json({ 
      text: response.text, 
      sources: sources,
      modelUsed: finalModelUsed
    });
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
    
    const primaryModel = "gemma-4-e4b-it";
    let finalModelUsed = primaryModel;
    let response;

    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert ATS and Resume Reviewer AI powered by the Gemma-4-e4b-it model.",
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
    } catch (error: any) {
      console.warn(`Model ${primaryModel} failed. Falling back to gemini-2.5-flash. Error: ${error.message}`);
      finalModelUsed = "gemini-2.5-flash";
      response = await ai.models.generateContent({
        model: finalModelUsed,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert ATS and Resume Reviewer AI powered by the Gemma-4-e4b-it model (via cloud-assisted fallback).",
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
    }

    const result = JSON.parse(response.text || "{}");
    res.json({ ...result, modelUsed: finalModelUsed });
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
    
    const primaryModel = "gemma-4-26b-a4b-it";
    let finalModelUsed = primaryModel;
    let response;

    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert technical and HR interviewer powered by the Gemma-4-26b-a4b-it model.",
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
    } catch (error: any) {
      console.warn(`Model ${primaryModel} failed. Falling back to gemini-2.5-flash. Error: ${error.message}`);
      finalModelUsed = "gemini-2.5-flash";
      response = await ai.models.generateContent({
        model: finalModelUsed,
        contents: prompt,
        config: {
          systemInstruction: "You are an expert technical and HR interviewer powered by the Gemma-4-26b-a4b-it model (via cloud-assisted fallback).",
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
    }

    const result = JSON.parse(response.text || "{}");
    res.json({ ...result, modelUsed: finalModelUsed });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API route for GitHub Repository analysis
app.post("/api/analyze-repo", async (req, res) => {
  try {
    const { repoName, username, description, languages, readmeContent } = req.body;
    const prompt = `Analyze this GitHub repository to give a detailed recruiter-readiness review:
Repository Name: ${repoName}
Owner/User: ${username}
Description: ${description || "No description provided"}
Primary Languages: ${languages ? languages.join(", ") : "Not specified"}
README Content:
${readmeContent || "No README.md content found or file is empty"}

Please return:
1. A recruiter appeal score (0 to 100)
2. A general assessment of the repository's presentation
3. Actionable README improvement suggestions
4. Architectural/code organization suggestions based on the technology profile
5. Crucial missing files (e.g. .env.example, tests, CI/CD configs) that would elevate this project.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert tech recruiter and principal software engineer reviewing portfolio code to evaluate candidate quality, powered by Gemma 4.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER", description: "Recruiter appeal score out of 100" },
            generalAssessment: { type: "STRING", description: "Summary of presentation, structure, and value" },
            readmeSuggestions: { type: "ARRAY", items: { type: "STRING" }, description: "Specific improvements to make the README stellar for recruiters" },
            codeSuggestions: { type: "ARRAY", items: { type: "STRING" }, description: "Code quality, structure, and architecture tips based on the language/stack" },
            missingFiles: { type: "ARRAY", items: { type: "STRING" }, description: "Standard files that are missing but highly recommended (e.g., tests, linter, LICENSE)" }
          },
          required: ["score", "generalAssessment", "readmeSuggestions", "codeSuggestions", "missingFiles"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Repo Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API route for AI Job Matcher (uses Google Search Tool)
app.post("/api/match-jobs", async (req, res) => {
  try {
    const { targetRole, skills } = req.body;
    const prompt = `Find open real-world job postings, active hiring updates, or actual current job listings and market insights for the role of "${targetRole}" requiring skills: "${skills}". Use Google Search to find real, actual open positions or very realistic current listings with details (title, company, location, salary, link/source).

Determine:
1. Active real job matches with a match score (0-100) based on how well they align with the skills: "${skills}".
2. The current percentage increase or decrease in hiring demand for this specific role in the tech industry.
3. The average salary for this role based on active listings or industry data.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert recruitment and job market intelligence agent powered by Gemma 4. Always use Google Search to ground listings in real industry data.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            jobs: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "Job title" },
                  company: { type: "STRING", description: "Company name" },
                  location: { type: "STRING", description: "Job location (e.g. Remote, City, State)" },
                  salary: { type: "STRING", description: "Salary range or estimation (e.g. $110k - $145k)" },
                  match: { type: "INTEGER", description: "Match percentage out of 100 based on provided skills" },
                  link: { type: "STRING", description: "Source link or URI where this job or similar jobs can be found" },
                  description: { type: "STRING", description: "One sentence summarizing key requirements or responsibilities" }
                },
                required: ["title", "company", "location", "salary", "match", "link"]
              }
            },
            marketTrend: { type: "STRING", description: "Hiring trend, e.g. '+14%' or '-2%'" },
            marketTrendDesc: { type: "STRING", description: "Short context about demand trends for this role" },
            avgSalary: { type: "STRING", description: "Average salary, e.g. '$135,000'" },
            avgSalaryDesc: { type: "STRING", description: "Short context explaining salary distribution or range" }
          },
          required: ["jobs", "marketTrend", "marketTrendDesc", "avgSalary", "avgSalaryDesc"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Match Jobs Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API route for AI Scaffold Generator
app.post("/api/generate-scaffold", async (req, res) => {
  try {
    const { title, desc, tech } = req.body;
    const prompt = `Generate a comprehensive step-by-step development roadmap, directory structure, and boilerplate starting code for the project: "${title}".
Description: "${desc}"
Tech stack to use: ${tech.join(", ")}

Your goal is to help a candidate build a stellar version of this project for their resume/portfolio. Provide a clean directory layout, 3 development steps with clear instructions and specific, fully written boilerplate starter files (no truncated codes), and recruiter-readiness advice.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert principal software architect. You provide highly educational and complete codebase scaffolding structures in JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            directoryTree: { type: "STRING", description: "Visual text-based directory tree of the project" },
            steps: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  phase: { type: "STRING", description: "e.g. 'Phase 1: Setup & State' or 'Step 1'" },
                  title: { type: "STRING" },
                  guide: { type: "STRING", description: "Detailed guide or architectural description of what to do" },
                  filename: { type: "STRING", description: "The filename for the starting boilerplate code" },
                  code: { type: "STRING", description: "Full starting code block for this file" }
                },
                required: ["phase", "title", "guide", "filename", "code"]
              }
            },
            recruiterTips: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Key recruiter appeal highlights"
            }
          },
          required: ["title", "directoryTree", "steps", "recruiterTips"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Generate Scaffold Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development or standard production environment
async function startServer() {
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

  // Only listen on a port if not running as a Vercel Serverless Function
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

startServer();

export default app;
