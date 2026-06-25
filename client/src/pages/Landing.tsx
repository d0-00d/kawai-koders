// client/src/pages/Landing.tsx
// Faithful React port of the reference HTML — no additions, no redesign.
import { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   ObsidianShader — void-obsidian WebGL background
   ───────────────────────────────────────────────────────────────── */
const ObsidianShader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas!.clientWidth  || window.innerWidth;
      const h = canvas!.clientHeight || window.innerHeight;
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width  = w;
        canvas!.height = h;
      }
    }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    ro?.observe(canvas);
    syncSize();
    window.addEventListener('resize', syncSize);

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 v_texCoord;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;
  x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;
  vec3 h=abs(x)-.5;
  vec3 a0=x-floor(x+.5);
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;
  g.x=a0.x*x0.x+h.x*x0.y;
  g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
void main(){
  vec2 uv=v_texCoord;
  float n=snoise(uv*1.5+u_time*0.05);
  vec3 color1=vec3(0.24,0.30,0.35);
  vec3 color2=vec3(0.08,0.02,0.00);
  float t=sin(n*3.+u_time*0.2)*.5+.5;
  vec3 obsidian=mix(color2,color1,t*.5);
  float spec=pow(max(0.,n),12.);
  obsidian+=spec*.15;
  gl_FragColor=vec4(obsidian,0.8);
}`;

    function cs(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes  = gl.getUniformLocation(prog, 'u_resolution');

    let rafId = 0;
    function render(t: number) {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      if (uTime) gl!.uniform1f(uTime, t * 0.001);
      if (uRes)  gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', syncSize);
      ro?.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
};

/* ─────────────────────────────────────────────────────────────────
   Constellation Node Network — exact port of the inline <script>
   ───────────────────────────────────────────────────────────────── */
interface Particle {
  x: number; y: number;
  bx: number; by: number;
  vx: number; vy: number;
  size: number;
}

interface ConstellationProps {
  hoveredIdx: number;
  onEnter: (idx: number) => void;
  onLeave: () => void;
}

const Constellation: React.FC<ConstellationProps> = ({ hoveredIdx, onEnter, onLeave }) => {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const containerRef     = useRef<HTMLDivElement>(null);
  const homeRef          = useRef<HTMLAnchorElement>(null);
  const researchRef      = useRef<HTMLAnchorElement>(null);
  const papersRef        = useRef<HTMLAnchorElement>(null);
  const labRef           = useRef<HTMLAnchorElement>(null);
  const particlesRef     = useRef<Particle[]>([]);
  const hoveredIdxRef    = useRef(hoveredIdx);
  const traceProgressRef = useRef(0);
  const lastHoveredRef   = useRef(0);
  const rafRef           = useRef(0);

  // Keep ref in sync with prop
  useEffect(() => { hoveredIdxRef.current = hoveredIdx; }, [hoveredIdx]);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d')!;

    let width = 0, height = 0;

    function resize() {
      const rect = container!.getBoundingClientRect();
      width  = canvas!.width  = rect.width;
      height = canvas!.height = rect.height;
      initParticles();
    }

    function initParticles() {
      particlesRef.current = [];
      // Scale particle count to canvas area so density stays consistent
      // regardless of how wide the viewport is.
      const count = Math.min(Math.round((width * height) / 2200), 520);
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,  y: Math.random() * height,
          bx: Math.random() * width, by: Math.random() * height,
          vx: 0, vy: 0,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      const particles     = particlesRef.current;
      const hoveredIndex  = hoveredIdxRef.current;

      // Settle particles
      particles.forEach(p => {
        p.vx += (p.bx - p.x) * 0.02;
        p.vy += (p.by - p.y) * 0.02;
        p.vx *= 0.85; p.vy *= 0.85;
        p.x  += p.vx;  p.y  += p.vy;
      });

      // Get main node positions from DOM
      const nodeEls = [homeRef.current, researchRef.current, papersRef.current, labRef.current];
      const cr = canvas!.getBoundingClientRect();
      const mNodes = nodeEls.map(el => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2 };
      });

      const allNodes = [...particles, ...mNodes];
      const homeIdx   = particles.length;
      const targetIdx = particles.length + hoveredIndex;

      // Build adjacency + draw mesh
      ctx.lineWidth   = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();

      const adj: number[][] = Array.from({ length: allNodes.length }, () => []);

      for (let i = 0; i < allNodes.length; i++) {
        for (let j = i + 1; j < allNodes.length; j++) {
          const dx   = allNodes[i].x - allNodes[j].x;
          const dy   = allNodes[i].y - allNodes[j].y;
          const dist = dx * dx + dy * dy;
          // Main nav nodes get a wider connection radius so they are
          // always reachable through the mesh on any viewport width.
          const isMainI = i >= particles.length;
          const isMainJ = j >= particles.length;
          const threshold = (isMainI || isMainJ) ? 18000 : 8000;
          if (dist < threshold) {
            adj[i].push(j);
            adj[j].push(i);
            ctx.moveTo(allNodes[i].x, allNodes[i].y);
            ctx.lineTo(allNodes[j].x, allNodes[j].y);
          }
        }
        if (i < particles.length) {
          ctx.save();
          ctx.translate(allNodes[i].x, allNodes[i].y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(-particles[i].size / 2, -particles[i].size / 2, particles[i].size, particles[i].size);
          ctx.restore();
        }
      }
      ctx.stroke();

      // BFS + path trace
      if (hoveredIndex !== 0) {
        const prev    = new Array(allNodes.length).fill(-1);
        const visited = new Array(allNodes.length).fill(false);
        const q       = [homeIdx];
        visited[homeIdx] = true;
        while (q.length > 0) {
          const u = q.shift()!;
          if (u === targetIdx) break;
          for (const v of adj[u]) {
            if (!visited[v]) { visited[v] = true; prev[v] = u; q.push(v); }
          }
        }
        const path: number[] = [];
        let curr = targetIdx;
        if (prev[curr] !== -1 || curr === homeIdx) {
          while (curr !== -1) { path.unshift(curr); curr = prev[curr]; }
        }

        if (path.length > 1) {
          traceProgressRef.current += 0.15;
          if (traceProgressRef.current > path.length - 1) traceProgressRef.current = path.length - 1;

          ctx.save();
          ctx.strokeStyle = '#A8D8FF';
          ctx.shadowColor = '#A8D8FF';
          ctx.shadowBlur  = 20;
          ctx.lineWidth   = 2;
          ctx.lineCap     = 'round';
          ctx.lineJoin    = 'round';

          ctx.beginPath();
          ctx.moveTo(allNodes[path[0]].x, allNodes[path[0]].y);

          const maxIdx = Math.floor(traceProgressRef.current);
          for (let i = 1; i <= maxIdx; i++) {
            ctx.lineTo(allNodes[path[i]].x, allNodes[path[i]].y);
          }

          if (maxIdx < path.length - 1) {
            const sn = allNodes[path[maxIdx]];
            const en = allNodes[path[maxIdx + 1]];
            const t  = traceProgressRef.current - maxIdx;
            const cx = sn.x + (en.x - sn.x) * t;
            const cy = sn.y + (en.y - sn.y) * t;
            ctx.lineTo(cx, cy);
            ctx.stroke();

            // Bright tip
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cx, cy, 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.stroke();
            // Target pulse
            const tn = allNodes[path[path.length - 1]];
            ctx.fillStyle  = '#ffffff';
            ctx.shadowBlur = 20 + Math.sin(Date.now() * 0.005) * 8;
            ctx.beginPath();
            ctx.arc(tn.x, tn.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      } else {
        traceProgressRef.current = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    setTimeout(() => { resize(); draw(); }, 100);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const isActive = (idx: number) => idx === hoveredIdx;

  // Shared node diamond style factories
  const activeStyle: React.CSSProperties = {
    width: '1.25rem', height: '1.25rem',
    backgroundColor: '#A8D8FF',
    boxShadow: '0 0 25px rgba(168,216,255,0.8)',
    borderColor: '#A8D8FF',
    transform: 'rotate(45deg)',
    transition: 'all 0.3s',
    border: '1px solid #A8D8FF',
  };
  const inactiveStyle: React.CSSProperties = {
    width: '0.75rem', height: '0.75rem',
    backgroundColor: '#050505',
    boxShadow: '0 0 10px rgba(168,216,255,0.2)',
    borderColor: '#A8D8FF',
    transform: 'rotate(45deg)',
    transition: 'all 0.3s',
    border: '1px solid #A8D8FF',
  };

  // Node label style helper
  const labelStyle = (active: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: 'calc(50% + 18px)',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap',
    fontSize: active ? '11px' : '10px',
    color: active ? '#A8D8FF' : 'rgba(255,255,255,0.55)',
    transition: 'color 0.25s, font-size 0.25s',
    pointerEvents: 'none',
  });

  // Shared anchor hit-area style (the large transparent clickable zone)
  const hitArea = (top: string, left: string, size = '80px'): React.CSSProperties => ({
    position: 'absolute',
    top,
    left,
    transform: 'translate(-50%, -50%)',
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    cursor: 'none',
    textDecoration: 'none',
    pointerEvents: 'auto',
  });

  return (
    <div
      ref={containerRef}
      style={{
        /* Full-width breakout — escapes any max-width parent */
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        height: '740px',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Home — exact horizontal center */}
      <a
        ref={homeRef}
        href="#"
        style={hitArea('50%', '50%', '96px')}
        onMouseEnter={() => onEnter(0)}
        onMouseLeave={onLeave}
      >
        <div style={activeStyle} />
        <span style={labelStyle(true)}>Home</span>
      </a>

      {/* Research — top-left */}
      <a
        ref={researchRef}
        href="#"
        style={hitArea('18%', '12%')}
        onMouseEnter={() => { onEnter(1); traceProgressRef.current = lastHoveredRef.current !== 1 ? 0 : traceProgressRef.current; lastHoveredRef.current = 1; }}
        onMouseLeave={onLeave}
      >
        <div style={isActive(1) ? activeStyle : inactiveStyle} />
        <span style={labelStyle(isActive(1))}>Research</span>
      </a>

      {/* Papers — top-right */}
      <a
        ref={papersRef}
        href="#"
        style={hitArea('20%', '70%')}
        onMouseEnter={() => { onEnter(2); traceProgressRef.current = lastHoveredRef.current !== 2 ? 0 : traceProgressRef.current; lastHoveredRef.current = 2; }}
        onMouseLeave={onLeave}
      >
        <div style={isActive(2) ? activeStyle : inactiveStyle} />
        <span style={labelStyle(isActive(2))}>Papers</span>
      </a>

      {/* Lab — bottom-right */}
      <a
        ref={labRef}
        href="#"
        style={hitArea('78%', '72%')}
        onMouseEnter={() => { onEnter(3); traceProgressRef.current = lastHoveredRef.current !== 3 ? 0 : traceProgressRef.current; lastHoveredRef.current = 3; }}
        onMouseLeave={onLeave}
      >
        <div style={isActive(3) ? activeStyle : inactiveStyle} />
        <span style={labelStyle(isActive(3))}>Lab</span>
      </a>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Landing Page
   ───────────────────────────────────────────────────────────────── */
const Landing = () => {
  const [hoveredIdx, setHoveredIdx] = useState(0);

  // Custom cursor
  useEffect(() => {
    const cursor = document.getElementById('kohnrad-cursor');
    if (!cursor) return;
    const move = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
    };
    document.addEventListener('mousemove', move);
    return () => document.removeEventListener('mousemove', move);
  }, []);

  return (
    <div style={{ color: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Custom cursor */}
      <div
        id="kohnrad-cursor"
        style={{
          position: 'fixed', top: 0, left: 0, width: '8px', height: '8px',
          border: '1px solid rgba(168,216,255,0.8)', borderRadius: '9999px',
          pointerEvents: 'none', zIndex: 10000, mixBlendMode: 'difference',
          transition: 'transform 0.1s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      />

      {/* Grain overlay */}
      <div className="grain" aria-hidden="true" />

      {/* WebGL background */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, width: '100%', height: '100%' }}>
        <ObsidianShader />
      </div>

      {/* Math overlays */}
      <div
        className="math-overlay"
        aria-hidden="true"
        style={{ top: '25%', left: '10%', fontSize: '12px', opacity: 0.2, zIndex: 20 }}
      >
        {`∇ × E = −∂B/∂t\nf(x) = ∫ e^(-st) F(t) dt\nL = -∑ y_i log(p_i)`}
      </div>
      <div
        className="math-overlay"
        aria-hidden="true"
        style={{ top: '40%', right: '15%', fontSize: '12px', opacity: 0.2, zIndex: 20, textAlign: 'right' }}
      >
        {`Attention(Q,K,V) = softmax(QK^T / √d_k)V\nW_q = quantize(W, b)\nP(y|x) = ∏ p(y_t | y_<t, x; θ)`}
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative', zIndex: 10, width: '100%', minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Text content — stays max-width constrained */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '80px 48px 0', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '768px' }}>

            {/* Badge row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ width: '24px', height: '1px', background: '#A8D8FF', display: 'block' }} />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8D8FF',
                }}
              >
                SLM_Architecture_v2.4
              </span>
            </div>

            {/* H1 */}
            <h1
              style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: 'clamp(44px, 7vw, 68px)',
                lineHeight: 1.04, letterSpacing: '-0.03em', fontWeight: 400,
                marginBottom: '32px',
              }}
            >
              <span style={{ opacity: 0.95 }}>BARE-METAL</span><br />
              <span style={{ opacity: 0.75, color: '#A8D8FF' }}>INFERENCE</span><br />
              <span style={{ opacity: 0.55 }}>AT THE EDGE</span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.35em',
                  color: '#A8D8FF', opacity: 0.8, marginLeft: '8px', fontWeight: 300,
                }}
              >
                θ
              </span>
            </h1>

            {/* Sub-copy */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '14px', lineHeight: 1.9,
                fontWeight: 300, color: 'rgba(255,255,255,0.65)',
                maxWidth: '520px', marginBottom: '40px',
              }}
            >
              Pioneering Small Language Models (SLMs) through mechanistic interpretability
              and mixed-precision quantization. Achieving sub-100ms latency on edge hardware
              with zero architectural compromise.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <a
                href="#"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 24px', background: '#A8D8FF', color: '#140501',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
                  transition: 'all 0.3s ease', cursor: 'none',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = '#ffffff';
                  el.style.transform  = 'translateY(-2px)';
                  el.style.boxShadow  = '0 0 25px rgba(168,216,255,0.4)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = '#A8D8FF';
                  el.style.transform  = 'translateY(0)';
                  el.style.boxShadow  = 'none';
                }}
              >
                Initialize Model
              </a>
              <a
                href="#"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                  transition: 'color 0.2s ease', cursor: 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#A8D8FF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'; }}
              >
                View Research <span style={{ transition: 'transform 0.2s' }}>→</span>
              </a>
            </div>

          </div>
        </div>

        {/* Constellation — full viewport width, outside max-width constraint */}
        <Constellation
          hoveredIdx={hoveredIdx}
          onEnter={idx => setHoveredIdx(idx)}
          onLeave={() => setHoveredIdx(0)}
        />
      </section>

      {/* ══════════════════════════════════════════════════════
          SLM ARCHITECTURE SECTION
          ══════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative', zIndex: 10, width: '100%', padding: '120px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#050505',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px' }}>

          {/* Section header */}
          <div
            style={{
              marginBottom: '64px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px',
            }}
          >
            <div style={{ maxWidth: '520px' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8D8FF', marginBottom: '16px' }}>
                / SLM_ARCHITECTURE
              </div>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '38px', lineHeight: 1.2, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '16px', opacity: 0.9 }}>
                Sparse Attention Primitives
              </h2>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)' }}>
                By strictly bounding the context window and applying a sliding-window attention mask {'[ A_ij = -∞ if |i-j| > w ]'}, we reduce computational complexity from O(N²) to O(N·w), enabling deterministic latency guarantees.
              </p>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', background: '#0a0a0a' }}>
              <div style={{ marginBottom: '8px', color: '#A8D8FF' }}>Params: 1.2B</div>
              <div style={{ marginBottom: '8px' }}>Quant: int4_GPTQ</div>
              <div>Lat: 42ms/token</div>
            </div>
          </div>

          {/* Diagram */}
          <div style={{ width: '100%', border: '1px solid rgba(255,255,255,0.06)', background: '#050505', padding: '48px', position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(168,216,255,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', opacity: 0.85 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {['x_1', 'x_2', 'x_3'].map(l => (
                  <div key={l} style={{ width: '36px', height: '36px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.65)' }}>{l}</div>
                ))}
                <div style={{ width: '36px', height: '36px', border: '1px solid #A8D8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#A8D8FF', boxShadow: '0 0 10px rgba(168,216,255,0.2)' }}>x_n</div>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ width: '256px', height: '48px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', background: '#0a0a0a' }}>
                EMBEDDING_LAYER
              </div>
              <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                  d_model = 2048
                </span>
              </div>
              <div style={{ width: '320px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', background: '#0a0a0a' }}>
                <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', marginBottom: '16px', color: '#A8D8FF', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px', letterSpacing: '0.08em' }}>
                  SPARSE_ATTENTION_BLOCK × 12
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                  {['Q', 'K', 'V'].map(l => (
                    <div key={l} style={{ flex: 1, height: '40px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{l}</div>
                  ))}
                </div>
              </div>
              <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ width: '192px', height: '40px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)', background: '#0a0a0a' }}>
                MLP_PROJECTION
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURE GRID SECTION
          ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, width: '100%', padding: '120px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px' }}>

          <div style={{ marginBottom: '64px', maxWidth: '520px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8D8FF', marginBottom: '16px' }}>/ APPLIED_RESEARCH</div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '38px', lineHeight: 1.2, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '16px', opacity: 0.9 }}>First-principles engineering</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)' }}>
              Stripping away monolithic bloat to focus on parameter efficiency and deterministic outputs.
            </p>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              {
                code: 'Q(W)', idx: '01', title: 'Mixed-Precision Quantization',
                body: 'Compressing weights to 4-bit integers while maintaining critical activation manifolds in fp16. W_q = round(W / ∆) × ∆.',
                tags: ['quantization', 'awq'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAC16RHYzvt8qRNOlKfY0fBjyj0fxwgSGxcZOpI4lOJ_CECXqA7DRPOB2ONSjgh-4FPZ4xB_d08YHtyV_VQxPPUy0YBjDjzp0H7Six_1nPhAdxbFJ5VYK_GDzVHfTWXNO2wOL7G2XnovXbYa-ip7_LFq_xTXPVhUtWO0vsqMc2Unr9IvGUHjtl8bRnQRKLnt3ZDhz2M9JPuT_jal_KWslwR4SkmvGe088IVKnp4IMPX-hrlpgeJhS0ymrzecNz5sFtoEhihT2YC3HY',
              },
              {
                code: 'I(f;x)', idx: '02', title: 'Mechanistic Interpretability',
                body: 'Reverse-engineering induction heads and sparse autoencoders to map internal representations to human-legible concepts.',
                tags: ['interpretability', 'sae'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_PBP4DkUanVHUGclJZkLiCL8VyzQqbKeUK-AEdp3DwoDG5khKBOF2z8gipjohlMfIcDjXpN9yOb3mODATGQgQXShtx24JYfOKMN7Y0tzcMyQkWlSdsjMm537Xw57TOE790unqnVVXmxEiVV8BLfSxxamZvmhHQLFKehm_uedDAr1e8uWjtny3aFB1WJuV0gSF2Qs52mXislpfjEZ7rP_khV8PFtoBAEtXpJFncFvNUYeZNzWnKxkRhObzKK6rNIHFCVgYo_hKgOc',
              },
              {
                code: 'O(N)', idx: '03', title: 'State Space Models',
                body: 'Replacing standard attention with structured state spaces (Mamba/RWKV) for true linear-time scaling during generation.',
                tags: ['ssm', 'linear-rnn'],
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0pKqD-SN22BkBCpDkcXYPzFAk-1skoDDQrRFO0RZaswXM74aPkzi_TTb_4c5angso2-c5HFQJ_n3E7jduxmsGRb4a4CcIkR6uABYNV53hN0TMLt03WA1Xa8_nhZ3pUR4uz1621SsgHcxZDXnybvMu9dQKjVhCWpS6HCddZNq0qABzWXCJLI_9qw6r_WF0-QvLA_-Wru-8TxyQJPM2AZSoJsmfxShP_SuYKj6QNbumE5TczGIX5hKM9aTTgLwkGoAJpOTbY_h6WzE',
              },
            ].map(card => (
              <div key={card.idx} className="pixel-card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Header bar */}
                <div style={{ height: '32px', background: '#0a0a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#A8D8FF', letterSpacing: '0.08em' }}>{card.code}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>{card.idx}</span>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {/* Image */}
                  <div style={{ width: '100%', height: '160px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden', background: '#050505' }}>
                    <img
                      src={card.img}
                      alt=""
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.25)', mixBlendMode: 'screen', opacity: 0.7 }}
                    />
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: '#ffffff', marginBottom: '8px', lineHeight: 1.3, opacity: 0.9 }}>{card.title}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '16px', flexGrow: 1 }}>{card.body}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                    {card.tags.map((tag, ti) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: '8.5px', letterSpacing: '0.06em',
                          color: ti === 0 ? 'rgba(168,216,255,0.8)' : 'rgba(255,255,255,0.45)',
                          border: ti === 0 ? '1px solid rgba(168,216,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          padding: '2px 8px',
                          background: ti === 0 ? 'rgba(168,216,255,0.05)' : 'transparent',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BENCHMARKING SECTION
          ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 10, width: '100%', padding: '120px 0', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#050505' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A8D8FF', marginBottom: '16px' }}>/ BENCHMARKING</div>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '38px', lineHeight: 1.2, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '24px', opacity: 0.9 }}>Efficiency vs. Scale</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: 1.8, color: 'rgba(255,255,255,0.65)', marginBottom: '24px' }}>
                Our 1.2B parameter model consistently outperforms 7B+ monolithic architectures on targeted reasoning tasks when constrained by{' '}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#A8D8FF' }}>latency &lt; 50ms</span>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'MMLU (0-shot)', value: '62.4%', color: '#ffffff' },
                  { label: 'HumanEval',    value: '48.1%', color: '#A8D8FF' },
                  { label: 'Tokens/sec (Edge TPU)', value: '114.2', color: '#ffffff' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.65)' }}>{row.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — graph */}
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a', padding: '24px', height: '300px', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ position: 'absolute', top: '24px', left: '24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Performance (Task Specific)</div>
              <div style={{ position: 'absolute', bottom: '24px', right: '24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Parameter Count (Log Scale)</div>
              <div style={{ width: '100%', height: '200px', borderLeft: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', marginLeft: '16px', marginBottom: '16px' }}>
                {/* Grid lines */}
                {['25%', '50%', '75%'].map(b => (
                  <div key={b} style={{ position: 'absolute', width: '100%', height: '1px', background: 'rgba(255,255,255,0.04)', bottom: b }} />
                ))}
                {/* Monolith line */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,90 Q30,85 50,60 T100,40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                </svg>
                {/* SLM line */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,90 L20,30 L40,25 L100,20" fill="none" stroke="#A8D8FF" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  <circle cx="20" cy="30" r="3" fill="#050505" stroke="#A8D8FF" strokeWidth="1.5" />
                  <text x="20" y="20" textAnchor="middle" fill="#A8D8FF" fontFamily="monospace" fontSize="4">1.2B</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 10, padding: '48px 0 40px', background: '#050505' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: '4px' }}>
              konhrad
            </span>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
              research_lab :: bare-metal_intelligence
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'rgba(168,216,255,0.6)', border: '1px solid rgba(168,216,255,0.2)', padding: '4px 8px' }}>
              v2.4.0-rc1
            </span>
            {['/docs', '/privacy', '/terms'].map(link => (
              <a
                key={link}
                href="#"
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', cursor: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#A8D8FF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
