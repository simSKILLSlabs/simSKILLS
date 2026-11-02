export enum Difficulty {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert"
}

export interface Resource {
  title: string;
  type: 'video' | 'article' | 'course' | 'documentation';
  url?: string;
  description: string;
  source?: string;
  isVerified?: boolean;
}

export interface Challenge {
  id: string;
  type: 'quiz' | 'bug-fix';
  question: string;         // For quiz: the question. For bug-fix: the description of the bug.
  options?: string[];       // For quiz: choices.
  codeSnippet?: string;     // For bug-fix: the buggy code.
  correctAnswer: string;    // For quiz: the option string. For bug-fix: the corrected line or concept.
  explanation: string;      // Why it is correct
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpAward: number;
}

export interface BugHuntChallenge {
  id: string;
  description: string;
  buggyCode: string;
  language: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpAward: number;
}

export interface ProjectTestCase {
  id: string;
  name: string;
  inputDescription: string;
  expectedOutput: string;
  testCode?: string;
}

export interface TestCaseRunResult {
  id: string;
  name: string;
  passed: boolean;
  inputDescription: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
}

export interface TestExecutionResult {
  passed: boolean;
  passCount: number;
  totalCount: number;
  stdout: string[];
  stderr: string[];
  executionTimeMs: number;
  results: TestCaseRunResult[];
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  difficulty: string;
  language?: string;
  starterCode?: string;
  walkthrough?: string;
  hints?: string[];
  testCases?: ProjectTestCase[];
}

export interface TeachingSection {
  title: string;
  theory: string;
  syntaxRule?: string;
  codeLanguage: string;
  codeExample: string;
  codeOutput?: string;
  explanation: string;
}

export interface TeachingPitfall {
  mistake: string;
  whyItHappens: string;
  fix: string;
  badCode?: string;
  goodCode?: string;
}

export interface ConceptCheckQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface TeachingModule {
  conceptExplanation: string; // "What it is"
  mentalModel?: string;       // Intuition / real-world analogy
  practicalGuide: string;     // "How to do it step-by-step"
  keyTakeaway: string;
  keyTerms?: KeyTerm[];
  sections?: TeachingSection[];
  pitfalls?: TeachingPitfall[];
  checkpointQuiz?: ConceptCheckQuestion[];
}

export interface Level {
  id: number;
  title: string; // e.g., "Foundations of Frontend"
  difficulty: Difficulty;
  description: string;
  topics: string[];
  // These are now optional for Lazy Loading
  teaching?: TeachingModule;
  resources?: Resource[];
  projects?: ProjectTask[];
  isLocked?: boolean;
  isCompleted?: boolean;
  isCached?: boolean;
}

export interface CareerRoadmap {
  id: string; // Unique ID for the roadmap
  createdAt: number; // Timestamp
  careerTitle: string;
  description: string;
  levels: Level[];
  extraProjects: ProjectTask[]; // New field for infinite practice
  isCurated?: boolean;
}

export interface GradingResult {
  score: number; // 0-100
  feedbackSummary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  xpAwarded: number;
  skillMatrix: {
    coding: number;
    logic: number;
    creativity: number;
    bestPractices: number;
    completeness: number;
  };
  submittedFiles?: Record<string, ProjectFile>;
  careerTitle?: string;
  testPassCount?: number;
  testTotalCount?: number;
  verificationHash?: string;
}

export interface ProjectHistoryItem extends GradingResult {
  projectId: string;
  projectTitle: string;
  timestamp: number;
}

export interface UserProfile {
  isLoggedIn: boolean;
  name: string;
  email: string;
  title?: string;
  bio?: string;
  portfolioId?: string;
  isPro: boolean;
  xp: number;
  streak: number;
  lastActivityDate?: string; // YYYY-MM-DD
  level: number;
  completedProjects: string[]; // Project IDs
  projectHistory: ProjectHistoryItem[]; // Past grades
  joinedDate?: string;
  dailyChallengesCompleted?: number;
  lastChallengeDate?: string; // YYYY-MM-DD
  bugHuntsCompletedToday?: number;
  lastBugHuntDate?: string; // YYYY-MM-DD
}

export interface PublicPortfolioSnapshot {
  portfolioId: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  joinedDate: string;
  xp: number;
  level: number;
  streak: number;
  isPro: boolean;
  verifiedProjects: ProjectHistoryItem[];
  updatedAt: number;
}

export interface Assessment {
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: 'Career' | 'Hobby' | 'Skill-Up';
  commitment: 'Casual' | 'Intense';
}

export interface ProjectFile {
  content: string;
  language: string;
}

export interface ProjectDraft {
  files: Record<string, ProjectFile>; // filename -> content
  lastModified: number;
}