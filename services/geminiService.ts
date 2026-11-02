import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CareerRoadmap, GradingResult, Level, ProjectTask, Assessment, Challenge, BugHuntChallenge, Resource } from "../types";
import { getCuratedRoadmap, getCuratedChapterDetails, buildChapterCacheKey } from "./curatedTracks";
import { getCachedChapter, saveCachedChapter } from "./db";

// Initialize Gemini Client lazily to avoid startup errors if key is injected at runtime
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

const DEFAULT_MODEL = "gemini-3.8-flash";

// Disable thinking overhead for fast interactive curriculum & grading responses
const FAST_THINKING_CONFIG = { thinkingBudget: 0 };

export type LearningStyleMode = 'beginner' | 'standard' | 'deep';

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

const testCaseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING, description: "Clear unit test assertion title, e.g. 'Handles empty input array'" },
    inputDescription: { type: Type.STRING, description: "Readable description of the test input arguments" },
    expectedOutput: { type: Type.STRING, description: "Expected return value or console output" },
    testCode: { type: Type.STRING, description: "Executable expression calling the student's function and returning the result as string/JSON" }
  },
  required: ["id", "name", "inputDescription", "expectedOutput"]
};

// 2. COMPREHENSIVE CHAPTER SCHEMA (Cumulative Level-by-Level Textbook Format)
const levelDetailsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    teaching: {
      type: Type.OBJECT,
      properties: {
        conceptExplanation: {
          type: Type.STRING,
          description: "Comprehensive, multi-paragraph chapter introduction explaining what this chapter is about, how it builds on previous levels, and why these concepts matter."
        },
        sections: {
          type: Type.ARRAY,
          description: "4 comprehensive tutorial sections covering every topic in the level in full depth, ending with a 'Putting It All Together' section.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Clear section heading (e.g. '1. Storing Data with Variables')" },
              theory: {
                type: Type.STRING,
                description: "Thorough, multi-paragraph tutorial reading (2-3 substantial paragraphs separated by \\n\\n) that genuinely teaches the concept, how it works, the rules, and when to use it in clear, natural language."
              },
              syntaxRule: {
                type: Type.STRING,
                description: "The clean syntax formula or pattern showing the structure of this concept (1-4 lines)."
              },
              codeLanguage: {
                type: Type.STRING,
                description: "Language identifier e.g. javascript, typescript, python, html, sql, cpp"
              },
              codeExample: {
                type: Type.STRING,
                description: "Complete, realistic, well-commented code example demonstrating the concept in action."
              },
              codeOutput: {
                type: Type.STRING,
                description: "The exact console output or program result produced when running codeExample."
              },
              explanation: {
                type: Type.STRING,
                description: "Detailed step-by-step breakdown explaining what each part of codeExample does and why it produces codeOutput."
              }
            },
            required: ["title", "theory", "syntaxRule", "codeLanguage", "codeExample", "codeOutput", "explanation"]
          }
        },
        pitfalls: {
          type: Type.ARRAY,
          description: "2 to 3 common mistakes learners make on this topic, with Wrong vs Correct code snippets.",
          items: {
            type: Type.OBJECT,
            properties: {
              mistake: { type: Type.STRING },
              whyItHappens: { type: Type.STRING },
              fix: { type: Type.STRING },
              badCode: { type: Type.STRING, description: "Code snippet showing the mistake." },
              goodCode: { type: Type.STRING, description: "Code snippet showing the corrected code." }
            },
            required: ["mistake", "whyItHappens", "fix", "badCode", "goodCode"]
          }
        }
      },
      required: ["conceptExplanation", "sections", "pitfalls"]
    },
    resources: {
      type: Type.ARRAY,
      description: "2 to 3 recommended YouTube video tutorials for this chapter (videos ONLY, no articles).",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Specific YouTube video tutorial title." },
          type: { type: Type.STRING, enum: ["video"] },
          url: { type: Type.STRING, description: "Targeted YouTube search URL: https://www.youtube.com/results?search_query=..." },
          description: { type: Type.STRING },
          source: { type: Type.STRING, description: "Channel or creator name e.g. FreeCodeCamp, Traversy Media, Programming with Mosh, Bro Code, Fireship." }
        },
        required: ["title", "type", "description", "url", "source"]
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
          difficulty: { type: Type.STRING },
          language: { type: Type.STRING },
          starterCode: { type: Type.STRING, description: "Starter boilerplate code with helpful '// STEP 1:' and '// STEP 2:' comments guiding the student." },
          walkthrough: { type: Type.STRING, description: "Clear step-by-step guide explaining how to solve this assignment using the concepts taught in the sections above." },
          hints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 progressive hints, where Hint 3 shows a concrete syntax nudge." },
          testCases: {
            type: Type.ARRAY,
            items: testCaseSchema,
            description: "3 unit test cases verifying the student's function or output."
          }
        },
        required: ["title", "description", "requirements", "difficulty", "language", "starterCode", "walkthrough", "hints", "testCases"]
      }
    }
  },
  required: ["teaching", "resources", "projects"]
};

export const generateRoadmap = async (career: string, assessment: Assessment, isPro: boolean): Promise<CareerRoadmap> => {
  // 1. Check Pre-Curated Core Tracks first (0ms instant load, $0 AI cost)
  const curated = getCuratedRoadmap(career);
  if (curated) {
    return curated;
  }

  const modelId = DEFAULT_MODEL;
  const levelCount = isPro ? "12 to 15" : "5";

  const beginnerProgressionRule =
    assessment.experience === 'Beginner'
      ? `CRITICAL FOR BEGINNERS:
      - Assume the user has ZERO prior coding experience at Level 1.
      - Level 1 (Beginner) MUST start from absolute scratch: What code is, storing values in variables, basic data types (text/numbers), and printing output.
      - Level 2 (Beginner) MUST teach simple decisions (if/else) and repeating actions (loops/lists).
      - Level 3 (Intermediate) MUST teach reusable building blocks (functions, parameters, return values).
      - Level 4+ should progressively introduce real ${career} tools, data structures, and projects step by step.
      - Each level MUST build logically and cumulatively on the previous level.`
      : `Progression should start at ${assessment.experience} level and smoothly ramp up in complexity from level to level, with each level building cumulatively on the previous one.`;

  const prompt = `Create a structured career learning roadmap skeleton for a student wanting to become a "${career}".
  
  CRITICAL DOMAIN VALIDATION: 
  This platform is EXCLUSIVELY for Computer Science, Software Engineering, Data Science, IT, and Hardware Engineering.
  
  STEP 1: Validate the Input "${career}".
  - If it IS related to Tech/CS (e.g., "Frontend Dev", "Data Analyst", "Python Developer", "Cybersecurity"):
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
  2. ${beginnerProgressionRule}
  3. For each level, provide ONLY:
     - ID (1, 2, 3...)
     - Title (Clear, friendly chapter title)
     - Difficulty ("Beginner" for early levels, then "Intermediate", "Advanced", "Expert")
     - Brief Description
     - 3 to 4 core Topics covered in this chapter
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
        responseMimeType: "application/json",
        responseSchema: roadmapSkeletonSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const rawData = JSON.parse(text);

    if (rawData.isValid === false) {
      throw new Error(rawData.validationMessage || "Invalid career path. Please enter a technology-related field.");
    }

    const data = rawData as CareerRoadmap;

    data.id = crypto.randomUUID();
    data.createdAt = Date.now();
    data.levels = (data.levels || []).map((lvl, idx) => ({
      ...lvl,
      id: lvl.id ?? idx + 1,
      topics: Array.isArray(lvl.topics) ? lvl.topics.slice(0, 4) : []
    }));
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
};

export const extendRoadmap = async (currentRoadmap: CareerRoadmap): Promise<Level[]> => {
  const modelId = DEFAULT_MODEL;
  const lastLevelId = currentRoadmap.levels[currentRoadmap.levels.length - 1].id;

  const prompt = `
  Extend the existing career roadmap for "${currentRoadmap.careerTitle}".
  Existing Levels: ${currentRoadmap.levels.length} (Last Level: ${currentRoadmap.levels[currentRoadmap.levels.length - 1].title}).
  Generate levels starting from ID ${lastLevelId + 1} up to ID 15, progressing smoothly into Advanced and Expert topics.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
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
};

// Exported helper: Fetch live YouTube video tutorials via Gemini Google Search Grounding in the background
export const fetchGroundedResources = async (levelTitle: string, careerTitle: string, topics: string[]): Promise<Resource[]> => {
  try {
    const ai = getAiClient();
    const searchPrompt = `Find the best YouTube programming video tutorials for learning "${levelTitle}" (${topics.join(", ")}) in ${careerTitle}.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: searchPrompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!chunks || !Array.isArray(chunks)) return [];

    const grounded: Resource[] = [];
    const seenUrls = new Set<string>();

    for (const chunk of chunks) {
      const uri: string | undefined = chunk.web?.uri;
      const rawTitle: string | undefined = chunk.web?.title;
      if (!uri || !rawTitle || seenUrls.has(uri)) continue;

      const isVideo = uri.includes("youtube.com") || uri.includes("youtu.be");
      if (!isVideo) continue;

      seenUrls.add(uri);

      grounded.push({
        title: rawTitle,
        type: "video",
        url: uri,
        description: `Verified YouTube video tutorial on ${levelTitle}`,
        source: "YouTube",
        isVerified: true,
      });

      if (grounded.length >= 4) break;
    }

    return grounded;
  } catch (error) {
    console.warn("Search grounding fallback:", error);
    return [];
  }
};

// Ensure all video recommendations use reliable YouTube search URLs unless verified by Google Search grounding
const sanitizeVideoResource = (res: Resource, levelTitle: string, careerTitle: string): Resource => {
  if (res.isVerified && res.url && res.url.startsWith("http")) {
    return { ...res, type: "video" };
  }
  const query = encodeURIComponent(`${careerTitle} ${levelTitle} ${res.title} tutorial`);
  return {
    ...res,
    type: "video",
    url: `https://www.youtube.com/results?search_query=${query}`,
    source: res.source || "YouTube",
    isVerified: false,
  };
};

export const generateLevelDetails = async (
  levelTitle: string,
  careerTitle: string,
  topics: string[],
  difficulty: string = "Beginner",
  levelNumber: number = 1,
  previousLevelsSummary: string = ""
): Promise<Partial<Level>> => {
  // 1. Check Pre-Curated Instant Chapters first
  const curatedChapter = getCuratedChapterDetails(careerTitle, levelNumber);
  if (curatedChapter) {
    return curatedChapter;
  }

  // 2. Check Two-Tier Global Curriculum Cache (LocalStorage + Firestore `curriculum_cache`)
  const cacheKey = buildChapterCacheKey(careerTitle, levelNumber, levelTitle);
  const cachedChapter = await getCachedChapter(cacheKey);
  if (cachedChapter) {
    return cachedChapter;
  }

  const modelId = DEFAULT_MODEL;

  const progressionContext =
    levelNumber === 1
      ? `LEVEL 1 FOUNDATION RULE:
      - This is Chapter 1 (Level 1). Assume the student is starting from scratch.
      - Explain every single keyword, symbol (like =, (), {}, ;, quotes), and concept from first principles in plain, clear English.
      - Do NOT skip steps or assume they already know coding jargon.`
      : `CUMULATIVE PROGRESSION RULE (Chapter ${levelNumber} — ${difficulty}):
      - Previous chapters already covered: ${previousLevelsSummary || "Basic foundations"}.
      - Build directly on top of those earlier concepts! Briefly connect new ideas to what they learned in earlier chapters, then teach the new concepts in full depth.
      - Match the depth and complexity to Level ${levelNumber} (${difficulty}): still crystal-clear and easy to read, but teaching real ${difficulty}-level programming skills.`;

  const prompt = `Write a comprehensive, self-contained W3Schools / FreeCodeCamp style textbook chapter for "${careerTitle}" — Chapter ${levelNumber} (${difficulty}): "${levelTitle}".
  
  Topics to teach in this chapter: ${topics.join(", ")}.

  ${progressionContext}

  CRITICAL TEACHING REQUIREMENTS (MAKE IT GENUINELY EDUCATIONAL):
  1. **Self-Contained & Thorough**: The student is reading THIS page to learn. We do NOT link to external articles—your writing MUST actually teach them the full concept, the rules, the syntax, and how to write the code from start to finish.
  2. **Chapter Introduction ('conceptExplanation')**:
     - Write 2 clear, engaging paragraphs explaining what this chapter teaches, real-world examples of where it is used, and how it fits into becoming a ${careerTitle}.
  3. **Deep Tutorial Sections ('sections')**:
     - Create 4 comprehensive sections: one for each core topic (${topics.join(", ")}) PLUS a final section titled "Putting It All Together: Complete Example" that combines the chapter's concepts into a realistic mini-program that prepares them directly for the assignments.
     - In EVERY section, provide:
       * 'title': Numbered heading (e.g., "1. Understanding Variables", "2. ...").
       * 'theory': 2 to 3 substantial, well-written paragraphs (separated by \\n\\n). Explain WHAT it is, WHY we need it, and HOW it works in plain, natural English. Teach the actual rules and mechanics!
       * 'syntaxRule': The clean syntax blueprint/formula so the student sees the exact pattern to type.
       * 'codeLanguage': The programming language.
       * 'codeExample': A clear, realistic, well-commented code example (10–25 lines depending on level).
       * 'codeOutput': The exact console/program output when that code runs.
       * 'explanation': A thorough line-by-line or block-by-block walkthrough explaining what the code does and WHY it produces that exact output.
  4. **Common Mistakes ('pitfalls')**:
     - 2 common mistakes students make on this chapter's topic, showing the 'badCode' (Wrong) vs 'goodCode' (Correct) and a clear explanation of the fix.
  5. **Video Tutorials ('resources')**:
     - 3 specific YouTube video tutorial suggestions (type: 'video') for learners who want to watch a video after reading.
  6. **Guided Coding Assignments ('projects')**:
     - 2 hands-on coding exercises that directly test the exact concepts and code taught in the sections above.
     - Each project MUST define a clear function or program in 'starterCode' and include 3 automated unit 'testCases' (with 'name', 'inputDescription', 'expectedOutput', and 'testCode' expression).
  `;

  try {
    const ai = getAiClient();

    const curriculumResponse = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
        responseMimeType: "application/json",
        responseSchema: levelDetailsSchema,
      }
    });

    const text = curriculumResponse.text;
    if (!text) throw new Error("No details generated");

    const data = JSON.parse(text) as Partial<Level>;

    if (data.teaching) {
      data.teaching.sections = Array.isArray(data.teaching.sections) ? data.teaching.sections : [];
      data.teaching.pitfalls = Array.isArray(data.teaching.pitfalls) ? data.teaching.pitfalls : [];
      data.teaching.keyTakeaway = data.teaching.keyTakeaway || "";
      data.teaching.practicalGuide = data.teaching.practicalGuide || "";
    }

    data.resources = (Array.isArray(data.resources) ? data.resources : []).map(r =>
      sanitizeVideoResource(r, levelTitle, careerTitle)
    );

    // Ensure unique IDs and normalized arrays for projects
    data.projects = (data.projects || []).map((p, i) => ({
      ...p,
      id: `${careerTitle.substring(0, 5).toLowerCase()}-${levelTitle.substring(0, 5).toLowerCase()}-${i}`.replace(/[^a-z0-9-]/g, ''),
      requirements: Array.isArray(p.requirements) ? p.requirements : [],
      hints: Array.isArray(p.hints) ? p.hints : [],
      language: p.language || 'javascript',
      starterCode: p.starterCode || `// Starter code for ${p.title}\n// STEP 1: Follow the requirements below\n`,
      walkthrough: p.walkthrough || '',
      testCases: Array.isArray(p.testCases) ? p.testCases : []
    }));

    data.isCached = true;

    // Save to Global Curriculum Cache so future requests load in 0ms
    await saveCachedChapter(cacheKey, data);

    return data;

  } catch (error) {
    console.error("Level Details Error", error);
    throw error;
  }
};

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
  levelDifficulty: string,
  testSuiteSummary?: string
): Promise<GradingResult> => {
  const modelId = DEFAULT_MODEL;
  const isBeginner = levelDifficulty === "Beginner";

  const personaPrompt = isBeginner
    ? `You are a friendly, encouraging Coding Mentor reviewing a beginner student's exercise.
    - Explain feedback in simple, plain English with zero jargon.
    - Celebrate what they got right!
    - If they made a syntax or logic mistake, gently show them how to fix it step by step.
    - Be generous with the score (80-100 if the core logic works, 50-75 if they made a good attempt).`
    : `You are a constructive Senior Staff Engineer reviewing a student's code at the ${levelDifficulty} level.
    - Give clear, actionable technical feedback appropriate for a ${levelDifficulty} developer.
    - Highlight what works well, point out bugs or edge cases, and suggest concrete improvements.`;

  const prompt = `
  ${personaPrompt}
  
  Project Title: ${project.title}
  Requirements: ${(project.requirements || []).join(", ")}
  ${testSuiteSummary ? `Automated Unit Test Suite Results:\n${testSuiteSummary}\n` : ''}
  Submission:
  ${userSubmission}
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No grading response");

    const parsed = JSON.parse(text) as GradingResult;
    return {
      ...parsed,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      skillMatrix: {
        coding: parsed.skillMatrix?.coding ?? 50,
        logic: parsed.skillMatrix?.logic ?? 50,
        creativity: parsed.skillMatrix?.creativity ?? 50,
        bestPractices: parsed.skillMatrix?.bestPractices ?? 50,
        completeness: parsed.skillMatrix?.completeness ?? 50,
      }
    };
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
    difficulty: { type: Type.STRING },
    language: { type: Type.STRING },
    starterCode: { type: Type.STRING },
    walkthrough: { type: Type.STRING },
    hints: { type: Type.ARRAY, items: { type: Type.STRING } },
    testCases: { type: Type.ARRAY, items: testCaseSchema }
  },
  required: ["id", "title", "description", "requirements", "difficulty", "language", "starterCode", "walkthrough", "hints", "testCases"]
};

export const generatePracticeProject = async (
  careerTitle: string,
  userXP: number
): Promise<ProjectTask> => {
  const modelId = DEFAULT_MODEL;
  const estimatedLevel = Math.floor(userXP / 1000) + 1;

  const prompt = `Generate a unique, challenging, single coding project assignment for a student learning "${careerTitle}".
  Student is roughly at Level ${estimatedLevel}.
  
  Provide:
  - Title
  - Description
  - 3-5 Specific Technical Requirements
  - Difficulty Rating
  - Primary programming language
  - Starter boilerplate code (15-25 lines with // TODO comments)
  - Step-by-step architectural walkthrough
  - 3 progressive hints
  - 3 automated unit testCases
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
        responseMimeType: "application/json",
        responseSchema: practiceProjectSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");

    const data = JSON.parse(text) as ProjectTask;
    data.id = `practice-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    data.requirements = Array.isArray(data.requirements) ? data.requirements : [];
    data.hints = Array.isArray(data.hints) ? data.hints : [];
    data.testCases = Array.isArray(data.testCases) ? data.testCases : [];
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
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    codeSnippet: { type: Type.STRING },
    correctAnswer: { type: Type.STRING },
    explanation: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    xpAward: { type: Type.INTEGER }
  },
  required: ["type", "question", "correctAnswer", "explanation", "difficulty", "xpAward"]
};

export const generateDailyChallenge = async (userLevel: number, careerFocus: string = "General Computer Science"): Promise<Challenge> => {
  const modelId = DEFAULT_MODEL;
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
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
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
  const modelId = DEFAULT_MODEL;
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
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
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
  const modelId = DEFAULT_MODEL;
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
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: FAST_THINKING_CONFIG,
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