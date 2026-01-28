
import React from 'react';
import { User, Sword, Map, Shield, Trophy, Mail } from 'lucide-react';
import { Skill, Project, Experience, Achievement } from './types';

export const PROFILE_DATA = {
  name: "Harsh Raj",
  role: "AI & ML Engineer | Full-Stack Developer",
  bio: "Level 22 Creative Engineer specializing in Gemini API integration, Computer Vision, and Cloud Architecture. Passionate about building intelligent, responsive systems that bridge the gap between complex LLM reasoning and intuitive user interfaces.",
  location: "Phagwara, Punjab",
  stats: {
    hp: 100,
    mp: 100,
    xp: 15000,
    level: 22
  }
};

export const SKILLS: Skill[] = [
  { name: "Python / C++", level: 94, category: "Backend", description: "Core logic, LLM integration, and algorithmic problem solving.", icon: "🐍" },
  { name: "React / Nodejs", level: 88, category: "Frontend", description: "Building modern, responsive UI and scalable backends.", icon: "⚛️" },
  { name: "Gemini API", level: 95, category: "Tools", description: "Deep analysis, code-review automation, and verification pipelines.", icon: "🤖" },
  { name: "OpenCV / MediaPipe", level: 85, category: "Design", description: "Computer vision and real-time gesture tracking.", icon: "👁️" },
  { name: "Tailwind CSS", level: 90, category: "Frontend", description: "Rapid utility-first styling for sleek interfaces.", icon: "🎨" },
  { name: "Oracle Cloud (OCI)", level: 82, category: "Tools", description: "Foundations, DevOps, and Generative AI certifications.", icon: "☁️" },
  { name: "Firebase / MySQL", level: 80, category: "Backend", description: "Data persistence and real-time sync.", icon: "💾" },
  { name: "Java / C", level: 75, category: "Backend", description: "Foundational object-oriented and systems programming.", icon: "☕" }
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "AI Code Reviewer",
    description: "LLM-powered code-review system using Gemini's deep-analysis endpoints to detect logic errors and vulnerabilities with ~94% accuracy.",
    techStack: ["Python", "React", "Gemini API", "TypeScript"],
    link: "https://github.com/harshraj911",
    image: "https://picsum.photos/seed/codereview/800/450",
    difficulty: "Legendary",
    xpReward: 3500
  },
  {
    id: "p2",
    title: "AI Doc Verification",
    description: "Integrated OCR with Gemini field-validation to authenticate IDs and certificates, detecting inconsistent or tampered text regions.",
    techStack: ["Node.js", "Tesseract OCR", "Gemini API", "React"],
    link: "https://github.com/harshraj911",
    image: "https://picsum.photos/seed/verification/800/450",
    difficulty: "Hard",
    xpReward: 3000
  },
  {
    id: "p3",
    title: "Gesture Presentation",
    description: "Real-time gesture-controlled presentation system using MediaPipe for touchless navigation and virtual whiteboard drawing (28 FPS).",
    techStack: ["Python", "OpenCV", "MediaPipe", "PyAutoGUI"],
    link: "https://github.com/harshraj911",
    image: "https://picsum.photos/seed/gesture/800/450",
    difficulty: "Hard",
    xpReward: 2500
  },
  {
    id: "p4",
    title: "KASH Video Calling",
    description: "Multi-user video calling platform leveraging ZegoCloud RTC SDK for low-latency (<200ms) audio/video communication.",
    techStack: ["Socket.io", "Node.js", "ZegoCloud SDK", "React"],
    link: "https://github.com/harshraj911",
    image: "https://picsum.photos/seed/video/800/450",
    difficulty: "Medium",
    xpReward: 2000
  },
  {
    id: "p5",
    title: "IoT Drip Irrigation",
    description: "Sensor-driven IoT farming system using soil-moisture, humidity, and temperature modules for adaptive irrigation control.",
    techStack: ["Arduino/ESP32", "Sensors", "Embedded C"],
    link: "https://github.com/harshraj911",
    image: "https://picsum.photos/seed/iot/800/450",
    difficulty: "Medium",
    xpReward: 1500
  }
];

export const EXPERIENCES: Experience[] = [
  {
    company: "Lovely Professional University",
    role: "B.Tech in CS (AI & ML)",
    period: "2023 - Present",
    bossName: "The Academic Architect",
    challenges: ["Sustaining high academic performance while mastering Al fundamentals.", "Building real-world applications in Python and Node.js concurrently."],
    achievements: ["Maintained 81% in Matriculate and 72% in Intermediate studies.", "Developing a Student Dropout Analysis project using predictive modeling."]
  },
  {
    company: "LPU Data Science Training",
    role: "Data Science Intern",
    period: "Jun 2025 - Jul 2025",
    bossName: "The Insight Sage",
    challenges: ["Navigating complex SQL queries and Power BI dashboard development.", "Applying ML assignments to real-world datasets for business insight."],
    achievements: ["Gained hands-on experience with SQL, Excel, and Power BI workflows.", "Developed predictive models to identify dropout risk factors in education."]
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { title: "OCI Generative AI Professional", issuer: "Oracle", date: "Sep 2025", description: "Certified expert in OCI Generative AI services and LLM deployment." },
  { title: "LeetCode Contest Master", issuer: "LeetCode", date: "Nov 2025", description: "Rating of 1812, achieving 232nd rank in Biweekly Contest 171." },
  { title: "OCI DevOps Professional", issuer: "Oracle", date: "Sep 2025", description: "Expertise in CI/CD, automation, and cloud-native infrastructure." },
  { title: "Master Generative AI", issuer: "Infosys Springboard", date: "Aug 2025", description: "Comprehensive training on ChatGPT, Generative AI tools, and Prompt Engineering." },
  { title: "OCI Foundations Associate", issuer: "Oracle", date: "Dec 2025", description: "Dual certifications in Cloud Infrastructure and Data Platform foundations." },
  { title: "Cyber Security & Forensics", issuer: "IIIT Kota", date: "Feb 2024", description: "Specialized training in digital forensics and system security." }
];

export const WORLD_MAP_NODES = [
  { id: 'profile' as const, label: 'Harsh Raj', icon: <User />, x: 15, y: 20 },
  { id: 'skills' as const, label: 'Abilities', icon: <Sword />, x: 45, y: 15 },
  { id: 'projects' as const, label: 'Dungeons', icon: <Map />, x: 75, y: 30 },
  { id: 'experience' as const, label: 'Raids', icon: <Shield />, x: 25, y: 65 },
  { id: 'achievements' as const, label: 'Loot Vault', icon: <Trophy />, x: 55, y: 75 },
  { id: 'contact' as const, label: 'Portal', icon: <Mail />, x: 85, y: 60 }
];
