

export enum Difficulty {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert"
}

export interface Resource {
  title: string;
  type: 'video' | 'article' | 'course';
  url?: string;
  description: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  difficulty: string;
}

export interface TeachingModule {
  conceptExplanation: string; // "What it is"
  practicalGuide: string; // "How to do it"
  keyTakeaway: string;
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
}

export interface CareerRoadmap {
  id: string; // Unique ID for the roadmap
  createdAt: number; // Timestamp
  careerTitle: string;
  description: string;
  levels: Level[];
  extraProjects: ProjectTask[]; // New field for infinite practice
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
  isPro: boolean;
  xp: number;
  streak: number;
  level: number;
  completedProjects: string[]; // Project IDs
  projectHistory: ProjectHistoryItem[]; // Past grades
  joinedDate?: string;
}

export interface Assessment {
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  goal: 'Career' | 'Hobby' | 'Skill-Up';
  commitment: 'Casual' | 'Intense';
}