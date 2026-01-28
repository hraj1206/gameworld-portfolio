
export type SectionId = 'profile' | 'skills' | 'projects' | 'experience' | 'achievements' | 'contact' | 'hub';

export interface Skill {
  name: string;
  level: number;
  description: string;
  category: 'Frontend' | 'Backend' | 'Design' | 'Tools';
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link: string;
  github?: string;
  image: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  xpReward: number;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  challenges: string[];
  achievements: string[];
  bossName: string; // Thematic name for the role/challenge
}

export interface Achievement {
  title: string;
  issuer: string;
  date: string;
  description: string;
}
