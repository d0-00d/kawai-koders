/**
 * PixelWaveBackground — Kohnrad
 *
 * Vertical bottom-to-top pixel tide with cubic-eased startup.
 *
 * Wave direction: BOTTOM (ocean body) → TOP (empty/dark)
 * waveY(col, t) defines the wave FRONT row per column — organic horizontal undulation.
 * Cells BELOW waveY are filled (ocean), ABOVE are empty.
 *
 * Intro: horizontal wave unrolls from off-screen right to left.
 * Session: plays once per tab session (sessionStorage). Reload skips to mid-loop.
 * Dev: set SKIP_INTRO = true to always skip, or clear sessionStorage manually.
 *
 * Tuning:
 * - CELL_SIZE: pixel grid size (default 10)
 * - rows * 0.75: wave front baseline position (lower = more ocean coverage)
 * - time multipliers in waveY: wave animation speed
 * - PARTICLE_MAX_SPEED: orange dot drift speed
 */

import React, { useRef, useEffect } from 'react';

// To force intro replay: sessionStorage.removeItem('kohnrad_intro_played') in browser console
// To always skip: set SKIP_INTRO = true at top of file
const SKIP_INTRO = false;
const HAS_PLAYED_KEY = 'kohnrad_intro_played';

const CELL_SIZE = 10;
const COLOR_BG = '#0a0a0a';
const COLOR_PRIMARY = '#aa8f2cff'; // acid lime green
const COLOR_SECONDARY = '#ab6f42ff'; // burnt orange
const COLOR_WHITE = 'rgba(255,255,255,0.01)'; // softer static cells
const COLOR_GRID = 'rgba(255,255,255,0.005)'; // softer grid lines

const PARTICLE_MAX_SPEED = 0.28;      // max velocity magnitude
const PARTICLE_LERP = 0.012;         // direction change smoothness
const PARTICLE_OPACITY_LERP = 0.008; // opacity breathe smoothness
const CURRENT_STRENGTH = 0.06;       // global current influence

interface Cell {
  type: 'wave' | 'empty';
  phase: number;
  speed: number;
  sizeRatio: number; // pre-jittered fill ratio within cell
}

interface DriftParticle {
  x: number;           // current world-space x (pixels)
  y: number;           // current world-space y (pixels)
  vx: number;          // current velocity x (pixels/frame)
  vy: number;          // current velocity y (pixels/frame)
  targetVx: number;    // velocity the particle is drifting toward (lerped)
  targetVy: number;    // velocity the particle is drifting toward (lerped)
  size: number;        // rendered square size: 4–8px
  opacity: number;     // current opacity (lerped)
  targetOpacity: number;
  phase: number;       // unique offset for sin-based wobble
  changeTimer: number; // frames until next direction nudge
  changeInterval: number; // randomized interval between nudges: 180–420 frames
}

type IntroPhase = 'entering' | 'done';

const PixelWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DriftParticle[]>([]);
  const introPhaseRef = useRef<IntroPhase>('entering');
  const introTimeRef = useRef<number>(0);
  const clockRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    console.log('PixelWaveBackground mounted');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Could not get 2d context');
      return;
    }

    // Session Memory
    const alreadyPlayed = SKIP_INTRO || sessionStorage.getItem(HAS_PLAYED_KEY) === 'true';
    if (alreadyPlayed) {
      introPhaseRef.current = 'done';
      clockRef.current = 8.0; // start mid-loop
    } else {
      introPhaseRef.current = 'entering';
      clockRef.current = 0;
      introTimeRef.current = 0;
    }

    let animationFrameId: number;

    let columns = 0;
    let rows = 0;
    let grid: Cell[][] = [];

    const initGrid = () => {
      // Set canvas size to screen size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      columns = Math.ceil(canvas.width / CELL_SIZE);
      rows = Math.ceil(canvas.height / CELL_SIZE);
      grid = [];

      for (let r = 0; r < rows; r++) {
        const rowData: Cell[] = [];
        for (let c = 0; c < columns; c++) {
          rowData.push({
            type: 'empty', // 'empty' will be recalculated for wave dynamically
            phase: Math.random() * Math.PI * 2,
            speed: 0.8 + Math.random() * 0.4,
            sizeRatio: 0.82 - Math.random() * 0.15,
          });
        }
        grid.push(rowData);
      }

      // Initialize Particles
      const numParticles = Math.floor((canvas.width * canvas.height) / 28000);
      const particles: DriftParticle[] = [];

      for (let i = 0; i < numParticles; i++) {
        // Density zones: 60% in lower 75% of screen, 40% full random
        let yPos;
        if (Math.random() < 0.6) {
          yPos = canvas.height * 0.25 + Math.random() * (canvas.height * 0.75);
        } else {
          yPos = Math.random() * canvas.height;
        }

        const vx = (Math.random() - 0.5) * 0.25;
        const vy = (Math.random() - 0.5) * 0.25;
        const opacity = 0.3 + Math.random() * 0.5;

        particles.push({
          x: Math.random() * canvas.width,
          y: yPos,
          vx: vx,
          vy: vy,
          targetVx: vx,
          targetVy: vy,
          size: 4 + Math.random() * 4,
          opacity: opacity,
          targetOpacity: opacity,
          phase: Math.random() * Math.PI * 2,
          changeTimer: Math.floor(Math.random() * 300),
          changeInterval: 180 + Math.floor(Math.random() * 240)
        });
      }
      particlesRef.current = particles;
    };

    // Easing functions
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
    const clamp = (val: number, min: number, max: number): number =>
      Math.max(min, Math.min(max, val));

    const draw = () => {
      if (canvas.width === 0 || canvas.height === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      // Clock system
      const now = performance.now() / 1000;
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const delta = Math.min(now - lastTimeRef.current, 0.05);
      lastTimeRef.current = now;
      clockRef.current += delta;
      
      if (introPhaseRef.current !== 'done') {
        introTimeRef.current += delta;
      }
      
      const time = clockRef.current;

      let introXOffset = 0;
      let easedT = 1;

      if (introPhaseRef.current === 'entering') {
        const t = clamp(introTimeRef.current / 1.6, 0, 1);
        easedT = easeOutCubic(t);
        introXOffset = (columns + 10) * (1 - easedT) - 10 * easedT;
        if (introTimeRef.current >= 1.6) {
          introPhaseRef.current = 'done';
          sessionStorage.setItem(HAS_PLAYED_KEY, 'true');
        }
      }

      const waveY = (col: number, t: number) => {
        return (
          rows * 0.75
          + Math.sin(col * 0.05 + t * 0.4) * 3
          + Math.sin(col * 0.1 + t * 0.6) * 1.5
          + Math.sin(col * 0.02 + t * 0.2) * 2
        );
      };

      const bandWidthFunc = (col: number, t: number) => {
        return 5 + Math.sin(col * 0.1 + t * 0.3) * 2;
      };

      // 1. Clear canvas
      ctx.fillStyle = COLOR_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw grid lines
      ctx.strokeStyle = COLOR_GRID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += CELL_SIZE) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }
      for (let y = 0; y <= canvas.height; y += CELL_SIZE) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      // 3. Draw cells
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          const cell = grid[r][c];

          let opacity = 0;
          let currentSizeRatio = 0;
          let color = COLOR_WHITE;
          let drawIt = true;

          const wY = waveY(c, time);
          const bw = bandWidthFunc(c, time);
          let isOceanOrFoam = false;

          if (r > wY + bw) {
            // BELOW wave front — ocean body (filled)
            opacity = 0.22 - 0.10 * (r / rows);
            currentSizeRatio = cell.sizeRatio;
            color = COLOR_PRIMARY;
            isOceanOrFoam = true;
          } else if (r >= wY - bw && r <= wY + bw) {
            // IN the wave front — foam/transition zone
            const positionInBand = r - (wY - bw);
            const bandProgress = Math.max(0, Math.min(1, positionInBand / (2 * bw)));
            opacity = bandProgress * 0.22;
            currentSizeRatio = 0.3 + bandProgress * 0.5;
            color = COLOR_PRIMARY;
            isOceanOrFoam = true;
          } else {
            // ABOVE wave front — empty (dark)
            opacity = 1;
            currentSizeRatio = 1;
            color = COLOR_WHITE;
          }

          // Apply right-to-left sweep mask during intro
          if (introPhaseRef.current === 'entering') {
            const sweepEdge = introXOffset + Math.sin(r * 0.1 + time * 0.5) * 3;
            if (c < sweepEdge) {
               // Mask out ocean/foam if it's to the left of the sweeping edge
               opacity = 1;
               currentSizeRatio = 1;
               color = COLOR_WHITE;
               isOceanOrFoam = false;
            } else if (isOceanOrFoam) {
               opacity *= easedT;
            }
          }

          if (r * CELL_SIZE < 56) {
            opacity = Math.min(opacity, 0.30);
          }

          if (color !== COLOR_WHITE && opacity < 0.02) {
            drawIt = false; // skip drawing
          }

          if (drawIt) {
            const cellSize = CELL_SIZE * currentSizeRatio;
            const x = c * CELL_SIZE + (CELL_SIZE - cellSize) / 2;
            const y = r * CELL_SIZE + (CELL_SIZE - cellSize) / 2;

            ctx.fillStyle = color;
            if (color === COLOR_PRIMARY || color === COLOR_SECONDARY) {
              ctx.globalAlpha = opacity;
            } else {
              ctx.globalAlpha = 1;
            }

            ctx.beginPath();
            ctx.rect(x, y, cellSize, cellSize); // using flat rect for guaranteed safe execution
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;

      // Drift Particle System
      const currentDriftX = Math.sin(time * 0.04) * CURRENT_STRENGTH;
      const currentDriftY = Math.cos(time * 0.025) * 0.03;

      particlesRef.current.forEach(particle => {
        // 1. Direction nudge timer
        particle.changeTimer -= 1;
        if (particle.changeTimer <= 0) {
          particle.targetVx = (Math.random() - 0.5) * PARTICLE_MAX_SPEED;
          particle.targetVy = (Math.random() - 0.5) * 0.18; // slightly less vertical drift

          particle.targetVx += currentDriftX;
          particle.targetVy += currentDriftY;

          particle.changeInterval = 180 + Math.floor(Math.random() * 240);
          particle.changeTimer = particle.changeInterval;
        }

        // 2. Velocity lerp
        particle.vx += (particle.targetVx - particle.vx) * PARTICLE_LERP;
        particle.vy += (particle.targetVy - particle.vy) * PARTICLE_LERP;

        // 3. Position update
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 4. Boundary wrap
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;

        // 5. Opacity drift
        const pCol = particle.x / CELL_SIZE;
        const pRow = particle.y / CELL_SIZE;
        const wY = waveY(pCol, time);
        const bw = bandWidthFunc(pCol, time);

        let baseTargetOpacity = 0.08 + Math.abs(Math.sin(time * 0.3 + particle.phase)) * 0.15;

        // Hide particles if they are in the ocean wave pixels
        let inOcean = pRow >= wY - bw;
        if (introPhaseRef.current === 'entering') {
           const sweepEdge = introXOffset + Math.sin(pRow * 0.1 + time * 0.5) * 3;
           if (pCol < sweepEdge) {
              inOcean = false;
           }
        }
        if (inOcean) {
          baseTargetOpacity = 0;
        }

        particle.targetOpacity = baseTargetOpacity;
        particle.opacity += (particle.targetOpacity - particle.opacity) * PARTICLE_OPACITY_LERP;

        // Render only if visible
        if (particle.opacity > 0.01) {
          ctx.save();
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = COLOR_SECONDARY;

          const half = particle.size / 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(particle.x - half, particle.y - half, particle.size, particle.size, 1.5);
          } else {
            ctx.rect(particle.x - half, particle.y - half, particle.size, particle.size);
          }
          ctx.fill();
          ctx.restore();
        }
      });

      // 4. Fade Mask
      if (canvas.height > 0 && canvas.width > 0) {
        const topGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.08);
        topGradient.addColorStop(0, COLOR_BG);
        topGradient.addColorStop(1, 'rgba(10,10,10,0)');

        const leftGradient = ctx.createLinearGradient(0, 0, canvas.width * 0.08, 0);
        leftGradient.addColorStop(0, COLOR_BG);
        leftGradient.addColorStop(1, 'rgba(10,10,10,0)');

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = topGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.08);

        ctx.fillStyle = leftGradient;
        ctx.fillRect(0, 0, canvas.width * 0.08, canvas.height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      initGrid();
    };

    window.addEventListener('resize', handleResize);
    initGrid();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
};

export default PixelWaveBackground;
