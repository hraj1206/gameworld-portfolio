
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_MAP_NODES } from '../constants';
import { SectionId } from '../types';
import { playSfx, updateEngineSoundV2 } from './SoundManager';

interface WorldMapProps {
  onSelect: (id: SectionId) => void;
  onCollectXP: (amount: number) => void;
  isMuted: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

interface CollectionEffect {
  id: number;
  x: number;
  y: number;
}

interface TrailSegment {
  id: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
}

const WorldMap: React.FC<WorldMapProps> = ({ onSelect, onCollectXP, isMuted }) => {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [rotation, setRotation] = useState(0);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [trails, setTrails] = useState<TrailSegment[]>([]);
  const [showControlsHint, setShowControlsHint] = useState(true);
  
  const trailIdRef = useRef(0);
  const carRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: 50, y: 50 });
  const rotationRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastFrameMsRef = useRef<number | null>(null);
  const uiAccumRef = useRef(0);
  const trailAccumRef = useRef(0);
  const lastIsAcceleratingRef = useRef(false);
  const hintDismissedRef = useRef(false);
  const isMutedRef = useRef(isMuted);
  const onSelectRef = useRef(onSelect);
  const onCollectXPRef = useRef(onCollectXP);
  const [particles, setParticles] = useState<Particle[]>(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      collected: false
    }))
  );

  const [effects, setEffects] = useState<CollectionEffect[]>([]);
  const effectIdCounter = useRef(0);

  const keys = useRef<{ [key: string]: boolean }>({});
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      const key = e.key.toLowerCase();
      if (!keys.current[key]) {
        if (key === 'h') playSfx('horn', isMutedRef.current);
        if (key === 'e') playSfx('startup', isMutedRef.current);
      }
      keys.current[key] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hintDismissedRef.current) {
        hintDismissedRef.current = true;
        setShowControlsHint(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const dismissHint = () => {
    if (!hintDismissedRef.current) {
      hintDismissedRef.current = true;
      setShowControlsHint(false);
    }
  };

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onCollectXPRef.current = onCollectXP;
  }, [onCollectXP]);

  useEffect(() => {
    const update = (nowMs: number) => {
      const last = lastFrameMsRef.current;
      lastFrameMsRef.current = nowMs;
      const dt = last == null ? (1 / 60) : Math.min(0.05, (nowMs - last) / 1000);

      // keep original tuning roughly consistent with old "per-frame" constants
      const factor = dt * 60;

      const isTurningLeft = keys.current['arrowleft'] || keys.current['a'];
      const isTurningRight = keys.current['arrowright'] || keys.current['d'];
      const isPressingForward = keys.current['arrowup'] || keys.current['w'];
      const isPressingBackward = keys.current['arrowdown'] || keys.current['s'];

      let newRot = rotationRef.current;
      const turnSpeedPerFrame = 4;
      if (isTurningLeft) newRot -= turnSpeedPerFrame * factor;
      if (isTurningRight) newRot += turnSpeedPerFrame * factor;

      let accel = 0;
      if (isPressingForward) accel = 0.05 * factor;
      if (isPressingBackward) accel = -0.03 * factor;

      const maxSpeed = 0.8;

      const rad = (newRot - 90) * (Math.PI / 180);
      const fwdX = Math.cos(rad);
      const fwdY = Math.sin(rad);
      const rightX = -fwdY;
      const rightY = fwdX;

      // Apply acceleration along forward axis (keeps drift from "braking" too hard)
      const vX0 = velocityRef.current.x + fwdX * accel;
      const vY0 = velocityRef.current.y + fwdY * accel;

      // Drift model: preserve forward speed, damp sideways slip.
      // When turning at speed, reduce forward damping a bit (feels like momentum carry).
      const turning = isTurningLeft || isTurningRight;
      const speed0 = Math.sqrt(vX0 ** 2 + vY0 ** 2);

      const forwardFrictionPerFrame = turning && speed0 > 0.2 ? 0.992 : 0.985; // closer to 1 = less slowdown
      const lateralFrictionPerFrame = 0.92; // strong damping to prevent endless side-sliding

      const forwardFriction = Math.pow(forwardFrictionPerFrame, factor);
      const lateralFriction = Math.pow(lateralFrictionPerFrame, factor);

      const vForward = (vX0 * fwdX + vY0 * fwdY) * forwardFriction;
      const vLateral = (vX0 * rightX + vY0 * rightY) * lateralFriction;

      let newVelX = vForward * fwdX + vLateral * rightX;
      let newVelY = vForward * fwdY + vLateral * rightY;

      const speed = Math.sqrt(newVelX ** 2 + newVelY ** 2);
      if (speed > maxSpeed) {
        newVelX = (newVelX / speed) * maxSpeed;
        newVelY = (newVelY / speed) * maxSpeed;
      }

      let nextX = posRef.current.x + newVelX;
      let nextY = posRef.current.y + newVelY;

      nextX = Math.max(2, Math.min(98, nextX));
      nextY = Math.max(2, Math.min(98, nextY));

      posRef.current = { x: nextX, y: nextY };
      rotationRef.current = newRot;
      velocityRef.current = { x: newVelX, y: newVelY };

      const throttle01 = isPressingForward ? 1 : 0;
      const speed01 = Math.min(1, speed / maxSpeed);
      updateEngineSoundV2(throttle01, speed01, isMutedRef.current);

      // Update the car DOM directly every frame (no React re-render needed).
      if (carRef.current) {
        carRef.current.style.left = `${nextX}%`;
        carRef.current.style.top = `${nextY}%`;
        carRef.current.style.transform = `translate3d(-50%, -50%, 0) rotate(${newRot}deg)`;
      }

      const acceleratingNow = !!isPressingForward;
      if (acceleratingNow !== lastIsAcceleratingRef.current) {
        lastIsAcceleratingRef.current = acceleratingNow;
        setIsAccelerating(acceleratingNow);
      }

      // Throttle React state updates to reduce render jank.
      uiAccumRef.current += dt;
      if (uiAccumRef.current >= 1 / 30) {
        uiAccumRef.current = 0;
        setPos(posRef.current);
        setRotation(rotationRef.current);
      }

      // Trails are pretty expensive to re-render; update them at ~20fps.
      trailAccumRef.current += dt;
      if (speed > 0.1 && trailAccumRef.current >= 1 / 20) {
        trailAccumRef.current = 0;
        setTrails(prev => {
          const newTrails = [...prev];
          if (newTrails.length > 50) newTrails.shift();
          newTrails.push({ id: trailIdRef.current++, x: nextX, y: nextY, rotation: newRot, opacity: 0.2 });
          return newTrails;
        });
      }

      // Logic check for nodes
      WORLD_MAP_NODES.forEach(node => {
        const dx = nextX - node.x;
        const dy = nextY - node.y;
        if (Math.sqrt(dx*dx + dy*dy) < 4) {
          playSfx('enter', isMutedRef.current);
          onSelectRef.current(node.id);
        }
      });

      // Logic check for particles
      setParticles(prev => prev.map(p => {
        if (p.collected) return p;
        const dx = nextX - p.x;
        const dy = nextY - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < 3) {
          dismissHint();
          playSfx('collect', isMutedRef.current);
          onCollectXPRef.current(100);
          const newEffectId = effectIdCounter.current++;
          setEffects(current => [...current, { id: newEffectId, x: p.x, y: p.y }]);
          setTimeout(() => {
            setEffects(current => current.filter(e => e.id !== newEffectId));
          }, 1000);
          return { ...p, collected: true };
        }
        return p;
      }));

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current != null) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0c] cursor-crosshair">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Connector Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 15 20 L 45 15 L 75 30 L 85 60 L 55 75 L 25 65 Z" fill="none" stroke="#4f46e5" strokeWidth="0.2" />
      </svg>

      {/* Tire Trails */}
      {trails.map(t => (
        <div 
          key={t.id} 
          style={{ 
            left: `${t.x}%`, 
            top: `${t.y}%`, 
            opacity: t.opacity,
            transform: `translate(-50%, -50%) rotate(${t.rotation}deg)` 
          }}
          className="absolute w-6 h-[2px] bg-indigo-500/30 blur-[1px] pointer-events-none"
        />
      ))}

      {/* Ambient Decals/Monoliths */}
      {[
        {x: 30, y: 40, s: 2}, {x: 70, y: 70, s: 3}, {x: 80, y: 15, s: 1.5}
      ].map((m, i) => (
        <div 
          key={i} 
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20"
        >
          <div 
            className="w-8 h-12 bg-indigo-500/20 border border-indigo-500/40 rounded-sm animate-pulse"
            style={{ transform: `scale(${m.s})` }}
          />
          <div className="absolute top-full mt-2 w-full h-1 bg-indigo-500/10 blur-md rounded-full" />
        </div>
      ))}

      {/* XP Particles */}
      {particles.map(p => !p.collected && (
        <motion.div
          key={p.id}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          className="absolute w-2 h-2 bg-cyan-400 rounded-full blur-[1px] shadow-[0_0_10px_#22d3ee] z-10"
        />
      ))}

      {/* Burst Effects */}
      <AnimatePresence>
        {effects.map(eff => (
          <div key={eff.id} style={{ left: `${eff.x}%`, top: `${eff.y}%` }} className="absolute z-50 pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400 shadow-[0_0_15px_#22d3ee]"
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Overworld Nodes */}
      {WORLD_MAP_NODES.map((node) => {
        const dx = pos.x - node.x;
        const dy = pos.y - node.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const isNear = distance < 10;
        const isLocked = distance < 5;

        return (
          <div
            key={node.id}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-none"
          >
            <div className="relative">
              {/* Outer Scanner Ring */}
              <AnimatePresence>
                {isNear && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: [0, 0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 border border-indigo-500/50 rounded-full"
                  />
                )}
              </AnimatePresence>

              {/* Pulsing Active Area */}
              <motion.div 
                animate={{ 
                  scale: isNear ? 1.4 : 1.0, 
                  opacity: isNear ? 0.6 : 0.1,
                  borderColor: isLocked ? 'rgba(34, 211, 238, 0.6)' : 'rgba(79, 70, 229, 0.3)'
                }}
                className="absolute inset-0 border-2 rounded-2xl animate-pulse" 
              />

              {/* Lock-on Brackets */}
              <AnimatePresence>
                {isLocked && (
                  <motion.div
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="absolute -inset-4 pointer-events-none"
                  >
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Node Icon Container */}
              <motion.div 
                animate={{ 
                  scale: isNear ? 1.1 : 1.0,
                  y: isNear ? -5 : 0,
                  rotate: isNear ? [0, -2, 2, 0] : 0,
                  boxShadow: isNear 
                    ? '0 10px 25px -5px rgba(79, 70, 229, 0.4)' 
                    : '0 0 0px 0px rgba(0,0,0,0)'
                }}
                transition={isNear ? { repeat: Infinity, duration: 3 } : {}}
                className={`w-16 h-16 sm:w-20 sm:h-20 glass rounded-2xl flex items-center justify-center relative z-10 border border-white/5 transition-colors duration-300 ${isNear ? 'border-indigo-500/40 text-white shadow-2xl' : 'text-gray-500'}`}
              >
                 {React.cloneElement(node.icon as React.ReactElement, { size: 32 })}
              </motion.div>
            </div>

            {/* Node Label */}
            <motion.div 
              initial={false}
              animate={{ 
                opacity: isNear ? 1 : 0.4,
                y: isNear ? 8 : 4,
                scale: isNear ? 1.1 : 1.0,
                color: isLocked ? '#22d3ee' : (isNear ? '#818cf8' : '#4b5563')
              }}
              className="pixel-font text-[10px] uppercase tracking-widest text-center"
            >
              {node.label}
              {isLocked && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-[1px] bg-cyan-400 mt-1"
                />
              )}
            </motion.div>
          </div>
        );
      })}

      {/* The Car */}
      <div
        className="absolute z-40"
        ref={carRef}
        style={{ 
          left: `${pos.x}%`, 
          top: `${pos.y}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          willChange: 'transform'
        }}
      >
        <div className="relative w-10 h-14 flex items-center justify-center">
          {/* Car Chassis */}
          <div className={`w-6 h-10 bg-indigo-600 rounded-lg relative shadow-[0_0_20px_rgba(79,70,229,0.6)] border border-indigo-400/50`}>
            <div className="absolute top-2 left-1 right-1 h-3 bg-cyan-400/40 rounded-sm" />
            <div className="absolute -top-1 left-0 right-0 flex justify-around">
               <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[1px]" />
               <div className="w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[1px]" />
            </div>
            {/* Engine Flame */}
            {isAccelerating && (
              <motion.div 
                animate={{ height: [5, 15, 10], opacity: [0.5, 1, 0.5] }}
                className={`absolute top-full left-1/2 -translate-x-1/2 w-2 rounded-full blur-[1px] bg-rose-500`} 
              />
            )}
          </div>
        </div>
      </div>

      {/* HUD Info (auto hides after first display / interaction) */}
      {showControlsHint && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass px-6 py-2 rounded-xl border border-indigo-500/20 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-4"
          >
             <span>Navigate to a sector</span>
             <span className="w-px h-3 bg-white/10" />
             <span className="text-indigo-400 animate-pulse">WASD to Drive</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
