
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionId } from './types';
import HUD from './components/HUD';
import WorldMap from './components/WorldMap';
import { playSfx, updateEngineSound, updateEngineSoundV2 } from './components/SoundManager';
import { PROFILE_DATA } from './constants';
import { 
  ProfileView, 
  SkillTreeView, 
  ProjectsView, 
  ExperienceView, 
  AchievementsView, 
  ContactView 
} from './components/Sections';
import { ChevronLeft, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('hub');
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [xp, setXp] = useState(PROFILE_DATA.stats.xp);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 50 });

  const toggleFullScreen = () => {
    playSfx('hover', isMuted);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSection !== 'hub') {
        handleReturnToHub();
      }
      if (e.key.toLowerCase() === 'f') {
        toggleFullScreen();
      }
      if (e.key.toLowerCase() === 'm') {
        setIsMuted(prev => !prev);
        playSfx('hover', !isMuted);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, isMuted]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-mute engine when in info sections; resume idle when back to hub respecting mute toggle.
  useEffect(() => {
    if (activeSection === 'hub') {
      updateEngineSoundV2(0, 0, isMuted);
    } else {
      updateEngineSound(false, true);
    }
  }, [activeSection, isMuted]);

  const handleReturnToHub = () => {
    playSfx('exit', isMuted);
    setActiveSection('hub');
  };

  const handleSectionSelect = (id: SectionId) => {
    setActiveSection(id);
  };

  const handleCollectXP = (amount: number) => {
    // Strictly cap XP at 20,000
    setXp(prev => Math.min(20000, prev + amount));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileView />;
      case 'skills': return <SkillTreeView />;
      case 'projects': return <ProjectsView />;
      case 'experience': return <ExperienceView />;
      case 'achievements': return <AchievementsView />;
      case 'contact': return <ContactView />;
      default: return null;
    }
  };

  const handleStart = () => {
    playSfx('hover', isMuted);
    setHasStarted(true);
  };
useEffect(() => {
  const handler = (e: DeviceOrientationEvent) => {
    console.log(
      'beta:',
      e.beta,
      'gamma:',
      e.gamma,
      'alpha:',
      e.alpha
    );
  };

  window.addEventListener('deviceorientation', handler, true);

  return () =>
    window.removeEventListener('deviceorientation', handler, true);
}, []);
useEffect(() => {
  const handler = (e: DeviceOrientationEvent) => {
    console.log(
      'RAW GYRO EVENT → ',
      'beta:', e.beta,
      'gamma:', e.gamma,
      'alpha:', e.alpha
    );
  };

  window.addEventListener('deviceorientation', handler, true);

  return () => {
    window.removeEventListener('deviceorientation', handler, true);
  };
}, []);

  const SystemControls = () => (
    <div className="glass px-6 py-2 rounded-full flex items-center gap-6 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
      <button onClick={() => setIsMuted(!isMuted)} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />} 
        {isMuted ? 'Muted' : 'Audio On'}
      </button>
      
      <span className="w-px h-3 bg-white/10" />

      <button onClick={toggleFullScreen} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        {isFullscreen ? 'Exit' : 'Fullscreen'}
      </button>

      {hasStarted && (
        <>
          <span className="w-px h-3 bg-white/10 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-1.5 py-0.5 border border-white/20 rounded text-[8px]">ESC</span> HUB
          </div>
        </>
      )}
    </div>
  );

  if (!hasStarted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050507] relative overflow-hidden">
        <div className="absolute top-6 right-6 z-50">
          <SystemControls />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="z-10 flex flex-col items-center text-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
          >
             <h1 className="pixel-font text-3xl sm:text-5xl md:text-6xl text-white mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]">
               GAMEWORLD<br/><span className="text-indigo-500">PORTFOLIO</span>
             </h1>
             <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full" />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="group relative px-12 py-6 overflow-hidden rounded-xl"
          >
             <div className="absolute inset-0 bg-indigo-600 group-hover:bg-indigo-500 transition-colors" />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
             <span className="relative pixel-font text-lg text-white">PRESS START</span>
          </motion.button>
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="flex flex-col items-center gap-2"><div className="w-12 h-1 bg-white/20 rounded" /><span className="text-[8px] pixel-font">CONTROLS: WASD</span></div>
             <div className="flex flex-col items-center gap-2"><div className="w-12 h-1 bg-white/20 rounded" /><span className="text-[8px] pixel-font">TOGGLE: F / M</span></div>
             <div className="flex flex-col items-center gap-2"><div className="w-12 h-1 bg-white/20 rounded" /><span className="text-[8px] pixel-font">MULTI-REGIONAL</span></div>
             <div className="flex flex-col items-center gap-2"><div className="w-12 h-1 bg-white/20 rounded" /><span className="text-[8px] pixel-font">LOW LATENCY</span></div>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-[#0a0a0c] overflow-hidden">
      <HUD currentSection={activeSection} xp={xp} playerPos={playerPos} />
      <AnimatePresence mode="wait">
        {activeSection === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: "circIn" }}
            className="absolute inset-0 z-0"
          >
            <WorldMap 
              onSelect={handleSectionSelect} 
              onCollectXP={handleCollectXP} 
              onPositionChange={setPlayerPos}
              isMuted={isMuted} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 100 }}
            className="absolute inset-0 z-20 overflow-y-auto pt-32 pb-20 px-4 flex items-start justify-center bg-black/60 backdrop-blur-xl"
          >
            <div className="w-full relative">
              <div className="fixed top-24 right-4 z-50 flex gap-2">
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={handleReturnToHub}
                   className="glass p-3 rounded-xl text-indigo-400 border border-indigo-500/20 hover:border-indigo-400 transition-colors shadow-xl"
                 >
                   <ChevronLeft size={24} />
                 </motion.button>
              </div>
              {renderSection()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-4">
        <SystemControls />
      </div>
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-40" />
    </div>
  );
};

export default App;
