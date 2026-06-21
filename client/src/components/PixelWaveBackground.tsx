/**
 * PixelWaveBackground — WebGL Liquid-Metal Shader
 *
 * Implements the ANIMATION_2 WebGL shader:
 * Simplex-noise driven liquid-metal gradient using the project colour palette:
 *   Static White (#DCDCDD) ↔ Gunmetal-ish Void Black (#140501) tones
 *
 * The canvas fills the parent absolutely and is pointer-events-none.
 */

import { useRef, useEffect } from 'react';

const PixelWaveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Size sync ──────────────────────────────────────────── */
    const syncSize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(syncSize);
      ro.observe(canvas);
    }
    syncSize();

    /* ── WebGL context ──────────────────────────────────────── */
    const gl =
      (canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    /* ── Shaders ────────────────────────────────────────────── */
    const vs = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = /* glsl */ `
precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
varying vec2  v_texCoord;

// ── Simplex noise helpers ───────────────────────────────────
vec3 mod289v3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x)  { return mod289v3(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy  -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                         + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0),
                           dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz  + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = v_texCoord;

  // Mouse influence (normalised 0-1)
  vec2 mouse_n = u_mouse / u_resolution;
  float mouseDist = length(uv - mouse_n);
  float mouseRipple = snoise(uv * 3.0 + u_time * 0.15 + mouse_n * 2.0) * 0.12
                    * smoothstep(0.6, 0.0, mouseDist);

  float n = snoise(uv * 2.0 + u_time * 0.10) + mouseRipple;

  // ── Colour palette (from design system) ─────────────────────
  // Static White  #DCDCDD  → rgb(0.863, 0.863, 0.867)
  // Void Black    #140501  → rgb(0.078, 0.020, 0.004)
  // Ash Rose      #B57D7D  → rgb(0.710, 0.490, 0.490)
  // Signal Blue   #81B2D9  → rgb(0.506, 0.698, 0.851)
  // Mist Blue     #D9E1E9  → rgb(0.851, 0.882, 0.914)

  vec3 staticWhite = vec3(0.863, 0.863, 0.867);
  vec3 voidBlack   = vec3(0.078, 0.020, 0.004);
  vec3 ashRose     = vec3(0.710, 0.490, 0.490);
  vec3 signalBlue  = vec3(0.506, 0.698, 0.851);
  vec3 mistBlue    = vec3(0.851, 0.882, 0.914);

  // ── Primary liquid-metal: mostly Void Black with white highlights
  float t = sin(n * 5.0 + u_time * 0.5) * 0.5 + 0.5;
  // Base: start from Void Black, shimmer up toward Static White only in peaks
  vec3 chrome = mix(voidBlack, staticWhite, t * t * 0.55);

  // Second noise layer for depth variation
  float n2 = snoise(uv * 4.0 - u_time * 0.08);
  chrome = mix(chrome, voidBlack, smoothstep(0.2, 0.8, n2) * 0.35);

  // Ash Rose blush in mid-tones (30% secondary role)
  float rose_t = snoise(uv * 1.5 - u_time * 0.07) * 0.5 + 0.5;
  chrome = mix(chrome, ashRose, rose_t * 0.18);

  // Signal-Blue specular sheen on noise peaks
  float spec = pow(max(0.0, n), 8.0);
  chrome += signalBlue * spec * 0.22;

  // Mist-Blue vignette shimmer near edges
  float edge = 1.0 - smoothstep(0.3, 0.9, length(uv - 0.5) * 1.4);
  chrome = mix(chrome, mistBlue, (1.0 - edge) * 0.08);

  // Fully opaque – the canvas IS the background
  gl_FragColor = vec4(chrome, 1.0);
}`;

    /* ── Compile helpers ────────────────────────────────────── */
    const compileShader = (type: number, src: string): WebGLShader => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* ── Geometry (full-screen quad) ────────────────────────── */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    /* ── Uniforms ───────────────────────────────────────────── */
    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uRes   = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    /* ── Mouse tracking ─────────────────────────────────────── */
    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
        mouse.y = (1 - (e.clientY - rect.top) / rect.height) * canvas.height;
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    /* ── Render loop ────────────────────────────────────────── */
    // Clear to Void Black (#140501 = 0.078, 0.020, 0.004) every frame
    gl.clearColor(0.078, 0.020, 0.004, 1.0);

    let rafId = 0;
    const render = (t: number) => {
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (uTime)  gl.uniform1f(uTime, t * 0.001);
      if (uRes)   gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    /* ── Cleanup ────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      ro?.disconnect();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PixelWaveBackground;
