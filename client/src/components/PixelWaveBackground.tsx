import React, { useRef, useEffect } from 'react';

/**
 * PixelWaveBackground
 *
 * Renders a full-screen animated pixel/mosaic background that simulates an ocean shoreline effect.
 * It uses HTML5 Canvas for performance.
 *
 * Tuning:
 * - CELL_SIZE: Adjust the size of the pixels (default 10)
 * - Wave speed/math: Adjust the time multiplier inside `time * X` within waveY function
 * - Colours: Modify COLOR_PRIMARY, etc.
 *
 * Wave Math:
 * The wave is modeled as a sweeping line from bottom-left to top-right. We use sine functions
 * layered together (primary wave, secondary ripple, slow swell) to create natural-looking,
 * organic wave motion. Cells below the wave are fully filled, cells in the wave are partially filled
 * (transition), and cells above are 'empty'.
 */

const CELL_SIZE = 10;
const COLOR_BG = '#0a0a0a';
const COLOR_PRIMARY = '#aa8f2cff'; // acid lime green
const COLOR_SECONDARY = '#ab6f42ff'; // burnt orange
const COLOR_WHITE = 'rgba(255,255,255,0.03)'; // softer static cells
const COLOR_GRID = 'rgba(255,255,255,0.015)'; // softer grid lines

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

const PixelWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DriftParticle[]>([]);

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

    let animationFrameId: number;
    let time = 0;

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

    const waveY = (col: number, t: number) => {
      // Flatter, more horizontal wave resembling a calm seashore
      return (
        rows * 0.75  // Set wave much lower on the screen (75% down)
        + Math.sin(col * 0.05 + t * 0.4) * 3    // Long, gentle primary wave
        + Math.sin(col * 0.1 + t * 0.6) * 1.5   // Secondary ripple
        + Math.sin(col * 0.02 + t * 0.2) * 2    // Very slow swell
      );
    };

    const bandWidthFunc = (col: number, t: number) => {
      // Softer, more subtle foam transition area
      return 5 + Math.sin(col * 0.1 + t * 0.3) * 2;
    };

    const draw = () => {
      if (canvas.width === 0 || canvas.height === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      time += 0.016; // approx 60fps

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

          if (r > wY + bw) {
            // Below the wave band (deep sea body)
            // Reduced max opacity from 0.85 to 0.35 to be non-obtrusive
            opacity = 0.35 - 0.15 * (r / rows);
            currentSizeRatio = cell.sizeRatio;
            color = COLOR_PRIMARY;
          } else if (r >= wY - bw && r <= wY + bw) {
            // In the wave band (foam/transition zone)
            const positionInBand = r - (wY - bw); // 0 to 2*bw
            const bandProgress = Math.max(0, Math.min(1, positionInBand / (2 * bw)));
            opacity = bandProgress * 0.35;
            currentSizeRatio = 0.3 + bandProgress * 0.5; // Start small and grow to normal size
            color = COLOR_PRIMARY;
          } else {
            // Above wave band (empty)
            opacity = 1; // Alpha handled by COLOR_WHITE
            currentSizeRatio = 1; // Full cell for empty
            color = COLOR_WHITE;
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

      // Drift Particle System — particles are decoupled from the grid and move in
      // world-space. Tune PARTICLE_MAX_SPEED for faster drift, PARTICLE_LERP for
      // snappier direction changes, CURRENT_STRENGTH for tidal bias.
      const currentDriftX = Math.sin(time * 0.04) * CURRENT_STRENGTH;
      const currentDriftY = Math.cos(time * 0.025) * 0.03; // very minor vertical drift

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
        const c = particle.x / CELL_SIZE;
        const r = particle.y / CELL_SIZE;
        const wY = waveY(c, time);
        const bw = bandWidthFunc(c, time);

        let baseTargetOpacity = 0.25 + Math.abs(Math.sin(time * 0.3 + particle.phase)) * 0.55;
        
        // Hide particles if they are in the ocean wave pixels (below the top edge of the wave foam)
        if (r >= wY - bw) {
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
