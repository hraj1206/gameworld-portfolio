
let audioCtx: AudioContext | null = null;

// Engine Layers
let mainOsc: OscillatorNode | null = null;
let subOsc: OscillatorNode | null = null;
let noiseNode: AudioBufferSourceNode | null = null;
let engineGain: GainNode | null = null;
let engineFilter: BiquadFilterNode | null = null;
let noiseGain: GainNode | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const createNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

const setupEngine = (ctx: AudioContext) => {
  if (mainOsc) return;

  engineGain = ctx.createGain();
  engineFilter = ctx.createBiquadFilter();
  noiseGain = ctx.createGain();

  // 1. Main Grit Layer
  mainOsc = ctx.createOscillator();
  mainOsc.type = 'sawtooth';
  
  // 2. Sub Layer for Body
  subOsc = ctx.createOscillator();
  subOsc.type = 'triangle';

  // 3. Noise Layer for Exhaust/Turbo
  noiseNode = ctx.createBufferSource();
  noiseNode.buffer = createNoiseBuffer(ctx);
  noiseNode.loop = true;
  
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1000;

  // Connections
  mainOsc.connect(engineFilter);
  subOsc.connect(engineFilter);
  engineFilter.connect(engineGain);
  engineGain.connect(ctx.destination);

  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  // Initial State
  engineFilter.type = 'lowpass';
  engineFilter.Q.value = 12; // Increased resonance for a sharper, more defined "growl"
  engineGain.gain.setValueAtTime(0, ctx.currentTime);
  noiseGain.gain.setValueAtTime(0, ctx.currentTime);

  mainOsc.start();
  subOsc.start();
  noiseNode.start();
};

export const updateEngineSound = (isAccelerating: boolean, isMuted: boolean) => {
  if (isMuted) {
    if (engineGain && audioCtx) {
      engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      if (noiseGain) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }
    return;
  }

  const ctx = initAudio();
  setupEngine(ctx);

  if (engineGain && audioCtx && mainOsc && subOsc && engineFilter && noiseGain) {
    const now = audioCtx.currentTime;
    const rampTime = 0.2; 
    
    // Calculate RPM based on state
    let baseFreq = 40; // Lowered idle frequency for a deeper body
    let targetGain = 0.05; // Slightly decreased idle gain
    let noiseTargetGain = 0.015;

    if (isAccelerating) {
      baseFreq = 80; // Slightly lower max frequency for more "engine weight"
      targetGain = 0.12; // Slightly decreased acceleration gain
      noiseTargetGain = 0.045;
    }

    // Apply pitch to both oscillators (Sub is always half of Main)
    mainOsc.frequency.setTargetAtTime(baseFreq, now, rampTime);
    subOsc.frequency.setTargetAtTime(baseFreq / 2, now, rampTime);

    // Filter "opens up" as engine revs - adjusted factor for cleaner tone
    const filterFreq = baseFreq * 6;
    engineFilter.frequency.setTargetAtTime(filterFreq, now, rampTime);

    // Gains
    engineGain.gain.setTargetAtTime(targetGain, now, rampTime);
    noiseGain.gain.setTargetAtTime(noiseTargetGain, now, rampTime);
  }
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// New smoother engine model (keeps original updateEngineSound intact)
export const updateEngineSoundV2 = (throttle01: number, speed01: number, isMuted: boolean) => {
  if (isMuted) {
    if (engineGain && audioCtx) {
      engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      if (noiseGain) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    }
    return;
  }

  const ctx = initAudio();
  setupEngine(ctx);

  if (!engineGain || !audioCtx || !mainOsc || !subOsc || !engineFilter || !noiseGain) return;

  const now = audioCtx.currentTime;
  const rampTime = 0.12;

  const t = clamp01(throttle01);
  const s = clamp01(speed01);
  const rev = clamp01(0.35 * t + 0.65 * s);

  const idleHz = 38;
  const redlineHz = 125;
  const baseFreq = lerp(idleHz, redlineHz, rev);

  const targetGain = lerp(0.035, 0.12, clamp01(0.8 * t + 0.2 * s));
  const noiseTargetGain = lerp(0.006, 0.055, clamp01(0.6 * t + 0.4 * rev));

  mainOsc.frequency.setTargetAtTime(baseFreq, now, rampTime);
  subOsc.frequency.setTargetAtTime(baseFreq / 2, now, rampTime);

  const filterFreq = lerp(200, 1200, rev);
  engineFilter.frequency.setTargetAtTime(filterFreq, now, rampTime);

  engineGain.gain.setTargetAtTime(targetGain, now, rampTime);
  noiseGain.gain.setTargetAtTime(noiseTargetGain, now, rampTime);
};

export const playSfx = (type: 'enter' | 'exit' | 'collect' | 'hover' | 'horn' | 'startup', isMuted: boolean) => {
  if (isMuted) return;
  const ctx = initAudio();
  const now = ctx.currentTime;

  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  switch (type) {
    case 'enter':
      const enterOsc = ctx.createOscillator();
      enterOsc.connect(gain);
      enterOsc.type = 'sine';
      enterOsc.frequency.setValueAtTime(200, now);
      enterOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      enterOsc.start(now);
      enterOsc.stop(now + 0.4);
      break;

    case 'exit':
      const exitOsc = ctx.createOscillator();
      exitOsc.connect(gain);
      exitOsc.type = 'triangle';
      exitOsc.frequency.setValueAtTime(800, now);
      exitOsc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      exitOsc.start(now);
      exitOsc.stop(now + 0.5);
      break;

    case 'collect':
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      cOsc.type = 'sine';
      cOsc.connect(cGain);
      cGain.connect(ctx.destination);
      const freq1 = 987.77; 
      const freq2 = 1318.51; 
      cOsc.frequency.setValueAtTime(freq1, now);
      cOsc.frequency.setValueAtTime(freq2, now + 0.05);
      cGain.gain.setValueAtTime(0, now);
      cGain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      cGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      cOsc.start(now);
      cOsc.stop(now + 0.2);
      break;

    case 'hover':
      const hoverOsc = ctx.createOscillator();
      hoverOsc.connect(gain);
      hoverOsc.type = 'sine';
      hoverOsc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      hoverOsc.start(now);
      hoverOsc.stop(now + 0.05);
      break;

    case 'horn':
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(349.23, now); // F4
      osc2.frequency.setValueAtTime(440.00, now); // A4
      const hornGain = ctx.createGain();
      osc1.connect(hornGain);
      osc2.connect(hornGain);
      hornGain.connect(ctx.destination);
      hornGain.gain.setValueAtTime(0, now);
      hornGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      hornGain.gain.linearRampToValueAtTime(0.2, now + 0.15); // Sustain for a bit
      hornGain.gain.linearRampToValueAtTime(0, now + 0.85); // 0.7s decay starting from 0.15s
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
      break;

    case 'startup':
      const startupOsc = ctx.createOscillator();
      startupOsc.type = 'sawtooth';
      startupOsc.frequency.setValueAtTime(30, now);
      startupOsc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      startupOsc.frequency.exponentialRampToValueAtTime(45, now + 0.5);
      const startupGain = ctx.createGain();
      startupGain.gain.setValueAtTime(0, now);
      startupGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
      startupGain.gain.linearRampToValueAtTime(0, now + 0.5);
      startupOsc.connect(startupGain);
      startupGain.connect(ctx.destination);
      startupOsc.start(now);
      startupOsc.stop(now + 0.5);
      break;
  }
};
