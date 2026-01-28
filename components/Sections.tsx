
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PROFILE_DATA, SKILLS, PROJECTS, EXPERIENCES, ACHIEVEMENTS 
} from '../constants';
// Added Trophy to the lucide-react icons import
import { Github, ExternalLink, Download, ArrowRight, Sword, Shield, MapPin, Briefcase, Calendar, Trophy } from 'lucide-react';

export const ProfileView = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-4">
        <div className="aspect-square rounded-2xl bg-indigo-900/50 border-4 border-indigo-500/30 flex items-center justify-center overflow-hidden relative group">
           <img src="https://picsum.photos/seed/avatar/400/400" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
           <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
        </div>
        <button className="w-full py-3 glass rounded-xl text-indigo-400 hover:text-indigo-300 font-bold flex items-center justify-center gap-2 transition-all hover:bg-white/5 border border-indigo-500/20">
          <Download size={18} /> DOWNLOAD MANIFESTO (PDF)
        </button>
      </div>
      <div className="md:col-span-2 space-y-6">
        <div>
          <h2 className="pixel-font text-2xl text-indigo-400 mb-2">CHARACTER SHEET</h2>
          <h1 className="text-5xl font-bold">{PROFILE_DATA.name}</h1>
          <p className="text-indigo-300 font-mono tracking-widest mt-1">{PROFILE_DATA.role}</p>
        </div>
        <div className="glass p-6 rounded-2xl space-y-4 leading-relaxed text-gray-300 text-lg border-l-4 border-indigo-500">
          <p>{PROFILE_DATA.bio}</p>
          <div className="flex gap-4 pt-4 border-t border-white/5 text-sm uppercase font-bold text-gray-500">
             <span className="flex items-center gap-1"><MapPin size={14} /> {PROFILE_DATA.location}</span>
             <span className="flex items-center gap-1"><Calendar size={14} /> Age: 28</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SkillTreeView = () => {
  const categories = Array.from(new Set(SKILLS.map(s => s.category)));
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="pixel-font text-2xl text-indigo-400 mb-8 text-center">SKILL TREE ABILITIES</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500 border-b border-white/10 pb-2">{cat}</h3>
            {SKILLS.filter(s => s.category === cat).map((skill) => (
              <motion.div 
                whileHover={{ scale: 1.02, x: 5 }}
                key={skill.name} 
                className="glass p-4 rounded-xl relative overflow-hidden group border border-indigo-500/10"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl">{skill.icon}</span>
                  <span className="text-xs font-mono text-indigo-400">LVL {skill.level}</span>
                </div>
                <div className="text-sm font-bold mb-1">{skill.name}</div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500" style={{ width: `${skill.level}%` }} />
                </div>
                <div className="mt-2 text-[10px] text-gray-500 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {skill.description}
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProjectsView = () => (
  <div className="p-8 max-w-6xl mx-auto">
    <h2 className="pixel-font text-2xl text-indigo-400 mb-8">COMPLETED DUNGEONS</h2>
    <div className="grid md:grid-cols-2 gap-8">
      {PROJECTS.map((project) => (
        <motion.div 
          key={project.id}
          className="glass rounded-2xl overflow-hidden group border border-indigo-500/20"
        >
          <div className="relative aspect-video overflow-hidden">
            <img src={project.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-4 right-4 px-3 py-1 glass rounded-lg text-[10px] font-bold tracking-widest text-amber-400 border border-amber-400/30">
              {project.difficulty}
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">{project.title}</h3>
              <div className="flex gap-3">
                <a href={project.link} className="text-gray-400 hover:text-indigo-400"><ExternalLink size={20} /></a>
                <a href={project.github} className="text-gray-400 hover:text-indigo-400"><Github size={20} /></a>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map(tech => (
                <span key={tech} className="px-2 py-1 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/20 uppercase">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
               <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                 REWARD: <span className="font-mono">{project.xpReward} XP</span>
               </span>
               <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors">
                 ENTER LEVEL <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export const ExperienceView = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h2 className="pixel-font text-2xl text-indigo-400 mb-12 text-center">BOSS BATTLE LOGS</h2>
    <div className="space-y-12">
      {EXPERIENCES.map((exp, idx) => (
        <div key={idx} className="relative pl-12 border-l-2 border-indigo-500/30">
          <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-lg glass border border-indigo-500 flex items-center justify-center text-indigo-400">
            {idx === 0 ? <Sword size={16} /> : <Shield size={16} />}
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-2xl font-bold">{exp.role}</h3>
                <div className="text-indigo-400 font-bold flex items-center gap-2 mt-1">
                  <Briefcase size={14} /> {exp.company}
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-500 text-sm font-mono">{exp.period}</span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-rose-500 font-bold tracking-widest uppercase mb-1">Current Boss</div>
                <div className="text-lg font-bold text-gray-300">{exp.bossName}</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                  Battle Challenges
                </h4>
                <ul className="space-y-2">
                  {exp.challenges.map((c, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-rose-500 mt-1">●</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  Loot Earned
                </h4>
                <ul className="space-y-2">
                  {exp.achievements.map((a, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">★</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AchievementsView = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h2 className="pixel-font text-2xl text-indigo-400 mb-8 text-center">VAULT OF GLORY</h2>
    <div className="grid sm:grid-cols-2 gap-6">
      {ACHIEVEMENTS.map((ach, idx) => (
        <motion.div 
          key={idx}
          whileHover={{ y: -5 }}
          className="glass p-6 rounded-2xl border-t-2 border-amber-500/30"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
             <Trophy size={24} />
          </div>
          <h3 className="text-lg font-bold mb-1">{ach.title}</h3>
          <div className="text-amber-500 text-xs font-bold mb-2">{ach.issuer} • {ach.date}</div>
          <p className="text-sm text-gray-500">{ach.description}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export const ContactView = () => (
  <div className="p-8 max-w-2xl mx-auto">
    <h2 className="pixel-font text-2xl text-indigo-400 mb-8 text-center">THE FINAL PORTAL</h2>
    <div className="glass p-8 rounded-3xl border border-indigo-500/20">
      <form className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Adventurer Name</label>
            <input type="text" className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Communication Frequency</label>
            <input type="email" className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="john@domain.com" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Quest Message</label>
          <textarea rows={4} className="w-full glass bg-white/5 border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="How can we build the next digital realm together?"></textarea>
        </div>
        <button type="button" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]">
          CAST MESSAGE INTO PORTAL
        </button>
      </form>
      
      <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
        <a href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-indigo-500/20"><Github size={20} /></div>
          <span className="text-xs font-bold text-gray-500">GITHUB</span>
        </a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-indigo-500/20"><Shield size={20} /></div>
          <span className="text-xs font-bold text-gray-500">LINKEDIN</span>
        </a>
      </div>
    </div>
  </div>
);
