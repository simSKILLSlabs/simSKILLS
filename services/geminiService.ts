
// ... (Existing Imports)
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CareerRoadmap, GradingResult, Level, ProjectTask, Assessment, Challenge, BugHuntChallenge } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// 1. LIGHTWEIGHT SKELETON SCHEMA (Fast Generation)
const roadmapSkeletonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValid: { type: Type.BOOLEAN, description: "Set to false if the career is NOT related to Computer Science, Engineering, or Tech." },
    validationMessage: { type: Type.STRING, description: "A friendly error message explaining why the input was rejected." },
    careerTitle: { type: Type.STRING },
    description: { type: Type.STRING },
    levels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
          description: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "title", "difficulty", "description", "topics"]
      }
    }
  },
  required: ["isValid"]
};

// 2. DETAILED LEVEL CONTENT SCHEMA (On-Demand Generation)
const levelDetailsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    teaching: {
      type: Type.OBJECT,
      properties: {
        conceptExplanation: { type: Type.STRING, description: "Detailed explanation of the topic." },
        practicalGuide: { type: Type.STRING, description: "Step-by-step summary on how to actually do/implement it." },
        keyTakeaway: { type: Type.STRING }
      },
      required: ["conceptExplanation", "practicalGuide", "keyTakeaway"]
    },
    resources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["video", "article", "course"] },
          url: { type: Type.STRING, description: "A VALID, REAL URL to a top-quality YouTube video or official documentation. Do NOT make up fake URLs." },
          description: { type: Type.STRING }
        },
        required: ["title", "type", "description", "url"]
      }
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          difficulty: { type: Type.STRING }
        }
      }
    }
  },
  required: ["teaching", "resources", "projects"]
};

export const generateRoadmap = async (career: string, assessment: Assessment, isPro: boolean): Promise<CareerRoadmap> => {
  const modelId = "gemini-2.5-flash";

  // Skeleton generation is much faster
  const levelCount = isPro ? "15 to 20" : "5";
  const focus = isPro
    ? "extremely granular, slow-paced, deeply detailed progression."
    : "general overview, fast-track";

  const prompt = `Create a structured career learning roadmap skeleton for a student wanting to become a "${career}".
  
  CRITICAL DOMAIN VALIDATION: 
  This platform is EXCLUSIVELY for Computer Science, Software Engineering, Data Science, IT, and Hardware Engineering.
  
  STEP 1: Validate the Input "${career}".
  - If it IS related to Tech/CS (e.g., "Frontend Dev", "Data Analyst", "Embedded Engineer", "Cybersecurity"):
    Set 'isValid' to TRUE and generate the full roadmap.
  - If it is NOT related (e.g., "Chef", "Lawyer", "Yoga Teacher", "Accountant"):
    Set 'isValid' to FALSE.
    Set 'validationMessage' to: "SimSkill only supports careers in Computer Science & Engineering. Please enter a tech-related role."
    Do NOT generate the levels.

  User Context:
  - Current Experience: ${assessment.experience}
  - Goal: ${assessment.goal}
  - Account Tier: ${isPro ? "PRO" : "FREE"}

  Requirements (If Valid):
  1. The roadmap MUST have ${levelCount} levels.
  2. Progression should be ${focus}.
  3. Start the difficulty based on the user's experience.
  4. For each level, provide ONLY:
     - ID (incremental)
     - Title
     - Difficulty
     - Brief Description
     - 3-5 Key Topics keywords
  
  DO NOT generate full teaching modules or projects yet. Keep it lightweight for speed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSkeletonSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Parse partial response to check validity
    const rawData = JSON.parse(text);

    if (rawData.isValid === false) {
      throw new Error(rawData.validationMessage || "Invalid career path. Please enter a technology-related field.");
    }

    const data = rawData as CareerRoadmap;

    // Assign Client-side properties
    data.id = crypto.randomUUID();
    data.createdAt = Date.now();
    data.extraProjects = [];

    return data;

  } catch (error) {
    console.error("Gemini Roadmap Error:", error);
    throw error;
  }
};

const extensionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    levels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          title: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
          description: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "title", "difficulty", "description", "topics"]
      }
    }
  },
  required: ["levels"]
}

export const extendRoadmap = async (currentRoadmap: CareerRoadmap): Promise<Level[]> => {
  const modelId = "gemini-2.5-flash";
  const lastLevelId = currentRoadmap.levels[currentRoadmap.levels.length - 1].id;

  const prompt = `
  The user has upgraded to PRO. Extend the existing career roadmap for "${currentRoadmap.careerTitle}".
  
  Current Roadmap Context:
  - Existing Levels: ${currentRoadmap.levels.length}
  - Last Level Title: ${currentRoadmap.levels[currentRoadmap.levels.length - 1].title}
  
  Requirements:
  1. Generate levels starting from ID ${lastLevelId + 1} up to ID 20.
  2. Focus on Advanced and Expert topics.
  3. Seamlessly continue the progression from the last level.
  4. Provide the same lightweight skeleton structure (ID, Title, Difficulty, Description, Topics).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: extensionSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No extension generated");

    const data = JSON.parse(text) as { levels: Level[] };
    return data.levels;
  } catch (error) {
    console.error("Roadmap Extension Error", error);
    throw error;
  }
}

export const generateLevelDetails = async (levelTitle: string, careerTitle: string, topics: string[]): Promise<Partial<Level>> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
  Generate detailed educational content for a specific level in a "${careerTitle}" course.
  
  Level Title: ${levelTitle}
  Topics: ${topics.join(", ")}
  
  Provide:
  1. **Teaching Module**: 
     - 'conceptExplanation': Clear, in-depth explanation of the concepts. **Write this for a smart 15-year-old.** Use simple analogies, avoid unnecessary jargon, and keep it engaging.
     - 'practicalGuide': A "How-To" guide on implementing this concept in code. Use bullet points or numbered steps. **Focus on the "Apply It" aspect.**
     - 'keyTakeaway': One sentence summary.
  2. **Resources**: 
     - 2 High-Quality Video Links (YouTube). MUST be real, popular tutorials from channels like Traversy Media, Fireship, Net Ninja, FreeCodeCamp, etc.
     - 2 High-Quality Article/Doc Links (MDN, Official Docs, Dev.to).
     - **CRITICAL**: The 'url' field MUST be a valid https URL. Do not guess links. If unsure, use a generic search link like "https://www.youtube.com/results?search_query=..."
  3. **Projects**: 2 distinct, hands-on coding tasks to verify skills.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: levelDetailsSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No details generated");

    const data = JSON.parse(text) as Partial<Level>;

    // Ensure unique IDs for projects to track completion accurately based on career and level
    if (data.projects) {
      data.projects = data.projects.map((p, i) => ({
        ...p,
        id: `${careerTitle.substring(0, 5).toLowerCase()}-${levelTitle.substring(0, 5).toLowerCase()}-${i}`.replace(/[^a-z0-9-]/g, '')
      }));
    }

    return data;

  } catch (error) {
    console.error("Level Details Error", error);
    throw error;
  }
}

const gradingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    feedbackSummary: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    xpAwarded: { type: Type.INTEGER },
    skillMatrix: {
      type: Type.OBJECT,
      properties: {
        coding: { type: Type.INTEGER },
        logic: { type: Type.INTEGER },
        creativity: { type: Type.INTEGER },
        bestPractices: { type: Type.INTEGER },
        completeness: { type: Type.INTEGER },
      },
      required: ["coding", "logic", "creativity", "bestPractices", "completeness"]
    }
  },
  required: ["score", "feedbackSummary", "strengths", "weaknesses", "suggestions", "skillMatrix", "xpAwarded"]
};

export const gradeProject = async (
  project: ProjectTask,
  userSubmission: string,
  level: string
): Promise<GradingResult> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
  You are a strict, no-nonsense Senior Principal Engineer grading a junior's code.
  Level: ${level}
  
  Project Title: ${project.title}
  Requirements: ${project.requirements.join(", ")}
  
  Submission:
  ${userSubmission}
  
  Instructions:
  - Be BRUTAL but constructive. Do not sugarcoat.
  - If the code is inefficient, insecure, or messy, TEAR IT APART.
  - Assume the user wants to be an elite engineer, not a script kiddie.
  - Point out specific logic flaws, bad naming, and security risks.
  
  Outputs:
  - Score (0-100): Be stingy. High scores are only for perfection.
  - XP: 50-500 based on quality.
  - Feedback: Direct, technical, and critical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No grading response");

    return JSON.parse(text) as GradingResult;
  } catch (error) {
    console.error("Gemini Grading Error:", error);
    throw error;
  }
};

const practiceProjectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
    difficulty: { type: Type.STRING }
  },
  required: ["id", "title", "description", "requirements", "difficulty"]
};

export const generatePracticeProject = async (
  careerTitle: string,
  userXP: number
): Promise<ProjectTask> => {
  const modelId = "gemini-2.5-flash";
  const estimatedLevel = Math.floor(userXP / 1000) + 1;

  const prompt = `Generate a unique, challenging, single coding project assignment for a student learning "${careerTitle}".
  Student is roughly at Level ${estimatedLevel}.
  
  Provide:
  - Title
  - Description
  - 3-5 Specific Technical Requirements
  - Difficulty Rating
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: practiceProjectSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");

    const data = JSON.parse(text) as ProjectTask;
    // Overwrite ID to ensure uniqueness for practice projects
    data.id = `practice-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return data;
  } catch (error) {
    console.error("Practice Project Error:", error);
    throw error;
  }
};

// --- DAILY CHALLENGE ---

const dailyChallengeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["quiz", "bug-fix"] },
    question: { type: Type.STRING },
    // Only for quiz
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    // Only for bug-fix
    codeSnippet: { type: Type.STRING },

    correctAnswer: { type: Type.STRING },
    explanation: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    xpAward: { type: Type.INTEGER }
  },
  required: ["type", "question", "correctAnswer", "explanation", "difficulty", "xpAward"]
};

export const generateDailyChallenge = async (userLevel: number, careerFocus: string = "General Computer Science"): Promise<Challenge> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
  Generate a "Daily Challenge" for a student at Level ${userLevel} learning ${careerFocus}.
  
  It can be EITHER:
  1. A Multiple Choice Quiz Question (Type: 'quiz')
  2. A "Find the Bug" Code Snippet (Type: 'bug-fix')
  
  If 'quiz':
  - Provide a tricky but fair technical question.
  - Provide 4 options.
  - 'correctAnswer' must be one of the options.
  
  If 'bug-fix':
  - Provide a small snippet of code (Python, JS, or C++) in 'codeSnippet' that has a logic or syntax error.
  - 'question' should be "Find the bug in this code."
  - 'correctAnswer' should explain what is wrong and how to fix it.
  
  Target Difficulty: Based on Level ${userLevel}.
  Ensure the content is high quality and educational.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dailyChallengeSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No daily challenge generated");

    const data = JSON.parse(text) as Challenge;
    data.id = `daily-${Date.now()}`;
    return data;
  } catch (error) {
    console.error("Daily Challenge Error", error);
    throw error;
  }
};

const bugHuntSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    description: { type: Type.STRING },
    buggyCode: { type: Type.STRING },
    language: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    xpAward: { type: Type.INTEGER }
  },
  required: ["id", "description", "buggyCode", "language", "difficulty", "xpAward"]
};

export const generateBugHunt = async (careerPath: string, difficulty: string): Promise<BugHuntChallenge> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
  Generate a "Bug Hunter" challenge for a developer learning "${careerPath}".
  Difficulty: ${difficulty}.
  
  Requirements:
  1. Provide a code snippet (Python, JS, C++, or Java) typical for this career path.
  2. The code MUST have a specific, logical, or syntax bug.
  3. The bug should be subtle but findable.
  4. 'description' should describe the INTENDED behavior.
  
  Outputs:
  - buggyCode: The code with the error.
  - language: The programming language.
  - xpAward: appropriate for difficulty (100-500).
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: bugHuntSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No bug hunt generated");

    const data = JSON.parse(text) as BugHuntChallenge;
    data.id = `bug-${Date.now()}`;
    return data;
  } catch (error) {
    console.error("Bug Hunt Gen Error", error);
    throw error;
  }
};

const validationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: { type: Type.BOOLEAN },
    feedback: { type: Type.STRING }
  },
  required: ["isCorrect", "feedback"]
};

export const validateBugFix = async (originalBuggyCode: string, userSolution: string, taskDescription: string): Promise<{ isCorrect: boolean, feedback: string }> => {
  const modelId = "gemini-2.5-flash";
  const prompt = `
  Verify this Bug Fix.
  
  Task: ${taskDescription}
  
  Original Buggy Code:
  ${originalBuggyCode}
  
  User Solution:
  ${userSolution}
  
  Did the user fix the bug correctly and achieve the intended behavior?
  Return JSON: { isCorrect: boolean, feedback: string }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: validationSchema,
      }
    });

    const text = response.text;
    if (!text) return { isCorrect: false, feedback: "AI verification failed." };

    return JSON.parse(text);
  } catch (error) {
    console.error("Bug Fix Validation Error", error);
    return { isCorrect: false, feedback: "Error validating solution." };
  }
};