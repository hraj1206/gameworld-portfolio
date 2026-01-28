
import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { PROFILE_DATA, WORLD_MAP_NODES } from '../constants';
import { Heart, Zap, Star, Target } from 'lucide-react';
import { playSfx } from './SoundManager';

interface HUDProps {
  currentSection: string;
  xp: number;
  playerPos: { x: number, y: number };
}

const HUD: React.FC<HUDProps> = ({ currentSection, xp, playerPos }) => {
  const xpControls = useAnimation();
  const radarControls = useAnimation();
  const prevXp = useRef(xp);
  const [isScanning, setIsScanning] = useState(false);
  
  const maxXP = 20000;
  const xpPercentage = Math.min(100, (xp / maxXP) * 100);

  // Map 0-100 coordinates to a 4x4 grid (16 cells)
  const sectorX = Math.floor(playerPos.x / 25.1); // Using 25.1 to handle 100 correctly
  const sectorY = Math.floor(playerPos.y / 25.1);
  const activeSectorIndex = sectorY * 4 + sectorX;

  useEffect(() => {
    if (xp > prevXp.current) {
      xpControls.start({
        backgroundColor: ["#fbbf24", "#ffffff", "#fbbf24"],
        scaleY: [1, 1.2, 1],
        transition: { duration: 0.3 }
      });
    }
    prevXp.current = xp;
  }, [xp, xpControls]);

  const handleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    playSfx('startup', false); // Using startup as a radar sound
    radarControls.start({
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 1],
      transition: { duration: 1.5, ease: "circOut" }
    }).then(() => setIsScanning(false));
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 p-4 pointer-events-none select-none">
      <div className="flex justify-between items-start">
        {/* Profile Card Mini */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass p-3 rounded-xl border-l-4 border-indigo-500 w-64 pointer-events-auto"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/20">
              {PROFILE_DATA.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">{PROFILE_DATA.name}</div>
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest line-clamp-1">LVL {PROFILE_DATA.stats.level} {PROFILE_DATA.role}</div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Heart size={12} className="text-rose-500 fill-rose-500" />
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${PROFILE_DATA.stats.hp}%` }}
                  className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-cyan-400 fill-cyan-400" />
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${PROFILE_DATA.stats.mp}%` }}
                  className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                  <motion.div 
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    className="h-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] relative"
                  >
                    <motion.div animate={xpControls} className="absolute inset-0 bg-transparent" />
                  </motion.div>
                </div>
              </div>
              <div className="flex justify-between px-5 text-[8px] pixel-font text-amber-500/60 tracking-tighter">
                <span>XP</span>
                <span>{Math.floor(xp)} / {maxXP}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Location Badge */}
        <motion.div 
          key={currentSection}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass px-6 py-2 rounded-full border-b-2 border-indigo-500 text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Location: {currentSection === 'hub' ? 'World Overworld' : currentSection}
        </motion.div>

        {/* Interactive Tactical Mini-map */}
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={handleScan}
          className="glass w-36 h-36 rounded-xl hidden md:block overflow-hidden relative border-t-4 border-indigo-500 pointer-events-auto cursor-help group"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          
          {/* Grid Layout */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-2">
             {[...Array(16)].map((_, i) => {
               // Check if any node falls in this grid sector
               const hasNode = WORLD_MAP_NODES.some(node => {
                 const nSectorX = Math.floor(node.x / 25.1);
                 const nSectorY = Math.floor(node.y / 25.1);
                 return (nSectorY * 4 + nSectorX) === i;
               });

               return (
                 <div 
                   key={i} 
                   className={`
                    relative rounded-sm transition-all duration-300
                    ${i === activeSectorIndex ? 'bg-indigo-500/40 border border-indigo-400' : 'bg-white/5'}
                    ${hasNode ? 'shadow-[inset_0_0_4px_rgba(255,255,255,0.2)]' : ''}
                   `}
                 >
                   {/* Player Indicator */}
                   {i === activeSectorIndex && (
                     <motion.div 
                       animate={{ opacity: [0.4, 1, 0.4] }}
                       transition={{ repeat: Infinity, duration: 1.5 }}
                       className="absolute inset-0 bg-indigo-400/20"
                     />
                   )}
                   {/* Node blip */}
                   {hasNode && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full" />
                   )}
                 </div>
               );
             })}
          </div>

          {/* Radar Sweep Animation */}
          <motion.div 
            animate={radarControls}
            className="absolute inset-0 bg-indigo-500/10 pointer-events-none opacity-0 border border-indigo-400 rounded-full"
            style={{ margin: 'auto' }}
          />

          {/* Coordinates HUD overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-2 pointer-events-none">
            <div className="flex justify-between items-center text-[7px] font-mono font-bold text-gray-400 uppercase tracking-tighter bg-black/40 px-1 py-0.5 rounded">
               <div className="flex items-center gap-1">
                 <Target size={8} className={isScanning ? 'animate-spin text-indigo-400' : ''} />
                 <span>X:{playerPos.x.toFixed(1)}</span>
               </div>
               <span>Y:{playerPos.y.toFixed(1)}</span>
            </div>
            <div className="mt-1 text-[8px] font-bold text-indigo-400 flex justify-between uppercase opacity-60">
              <span>Map-Link</span>
              <span className="animate-pulse">Active</span>
            </div>
          </div>

          {/* Hover Tooltip */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-900/40 backdrop-blur-sm pointer-events-none">
            <span className="text-[8px] font-bold text-white uppercase tracking-widest">Diagnostic Scan</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HUD;
