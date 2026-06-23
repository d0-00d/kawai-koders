// client/src/pages/Landing.tsx
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PixelWaveBackground from '../components/PixelWaveBackground';

const tabs = ['Sub Tab 1', 'Sub Tab 2', 'Sub Tab 3', 'Sub Tab 4', 'Sub Tab 5'];

const Landing = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [mounted, setMounted] = useState(false);
  const [ctaPressed, setCtaPressed] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  // Trigger entrance animation after first paint
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────────── */}
      <main className="relative top-0 min-h-screen flex items-center overflow-hidden">
        <PixelWaveBackground />

        {/* ── Legibility scrim ────────────────────────────────────
            Radial gradient anchored behind the text block.
            NOT a hard card — feathers out to full transparency.
            Covers only the text column area, not the full hero.
        ──────────────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            // Anchored to left side, centred vertically on heading area
            top: 0,
            left: 0,
            width: '60%',
            height: '100%',
            zIndex: 15,
            pointerEvents: 'none',
            background: [
              // Primary scrim: dense dark cone directly behind heading
              'radial-gradient(ellipse 55% 50% at 20% 50%,',
              '  rgba(3,5,20,0.78) 0%,',
              '  rgba(3,5,20,0.55) 30%,',
              '  rgba(3,5,20,0.20) 60%,',
              '  transparent 100%',
              ')',
            ].join('\n'),
          }}
        />

        {/* ── Text block ──────────────────────────────────────── */}
        <div
          ref={blockRef}
          className="relative container mx-auto px-8 md:px-16 pt-[56px] flex flex-col items-start text-left"
          style={{ zIndex: 20 }}
        >
          {/*
            Vertical accent rule — 1 px Signal Blue, runs full height of
            the badge→CTA stack. Positioned to the left of the content via
            a thin absolute bar inside a relative wrapper.
          */}
          <div className="relative pl-5">

            {/* The rule itself */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: '2px',
                bottom: '2px',
                width: '1px',
                background: 'linear-gradient(to bottom, rgba(129,178,217,0.55) 0%, rgba(129,178,217,0.45) 60%, rgba(129,178,217,0.08) 100%)',
                borderRadius: '1px',
              }}
            />

            {/* ── 1. Badge ────────────────────────────────────── */}
            <div
              className="pixel-badge mb-5 inline-flex items-center gap-2"
              style={{
                fontFamily: 'var(--pixel-font)',
                // Entrance: badge first (delay 0ms)
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.45s ease, transform 0.45s ease',
                transitionDelay: '0ms',
              }}
            >
              {/* Status pulse dot */}
              <span
                className="hero-pulse-dot"
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  flexShrink: 0,
                }}
              />
              ▸ SYSTEM READY
            </div>

            {/* ── 2. Heading ──────────────────────────────────── */}
            <h1
              className="font-display font-bold tracking-[0.15em] leading-none mb-6"
              style={{
                fontSize: 'clamp(2.4rem, 7.5vw, 5rem)',
                color: 'var(--color-text)',
                // Multi-layer shadow: dark base for contrast + faint blue halo
                textShadow: [
                  '0 2px 12px rgba(3,5,20,0.95)',
                  '0 4px 32px rgba(3,5,20,0.85)',
                  '0 0 60px rgba(3,5,20,0.60)',
                  '0 0 4px rgba(129,178,217,0.15)',
                ].join(', '),
                // Entrance: heading second (delay 100ms)
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.50s ease, transform 0.50s ease',
                transitionDelay: '100ms',
              }}
            >
              KOHNRAD
            </h1>

            {/* ── 3. Body copy — constrained to ~40ch ─────────── */}
            <p
              className="font-sans font-light text-[18px] mb-10"
              style={{
                color: 'var(--color-muted)',
                maxWidth: '40ch',          // ≈ 40 characters per line
                lineHeight: 1.65,
                // Entrance: body third (delay 200ms)
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.50s ease, transform 0.50s ease',
                transitionDelay: '200ms',
              }}
            >
              Lorem ipsum
            </p>

            {/* ── 4. CTA button ───────────────────────────────── */}
            <button
              id="hero-cta-early-access"
              className="hero-cta relative font-medium tracking-wide uppercase text-sm px-8 py-3"
              style={{
                fontFamily: 'var(--pixel-font)',
                letterSpacing: '0.12em',
                clipPath:
                  'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',

                // State-driven colours
                background: ctaHovered ? '#030514' : 'var(--color-primary)',
                color: ctaHovered ? 'var(--color-primary)' : 'var(--color-bg)',
                border: ctaHovered
                  ? '1px solid var(--color-primary)'
                  : '1px solid transparent',
                boxShadow: ctaPressed
                  ? 'inset 0 2px 6px rgba(0,0,0,0.55), inset 0 1px 2px rgba(0,0,0,0.4)'
                  : ctaHovered
                    ? 'var(--pixel-glow)'
                    : 'var(--pixel-glow)',

                // Entrance: CTA last (delay 320ms)
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                transition: [
                  'opacity 0.50s ease',
                  'transform 0.50s ease',
                  'background 0.18s ease',
                  'color 0.18s ease',
                  'border-color 0.18s ease',
                  'box-shadow 0.18s ease',
                ].join(', '),
                transitionDelay: ctaHovered || ctaPressed ? '0ms' : '320ms',

                // Focus-visible ring handled via CSS class below
                outline: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => { setCtaHovered(false); setCtaPressed(false); }}
              onMouseDown={() => setCtaPressed(true)}
              onMouseUp={() => setCtaPressed(false)}
            >
              {/* Arrow shifts 4px right on hover */}
              <span
                style={{
                  display: 'inline-block',
                  marginRight: '6px',
                  transform: ctaHovered ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'transform 0.18s ease',
                }}
              >
                ▸
              </span>
              EARLY ACCESS
            </button>

          </div>{/* end relative pl-5 rule wrapper */}
        </div>
      </main>

      {/* ── Pixel-UI Tab Navigation ───────────────────────────── */}
      <div className="sticky top-[56px] z-40 w-full pixel-tab-bar">
        <div className="container mx-auto px-4 flex justify-center items-center gap-1 py-2 relative">
          <span
            className="hidden md:block select-none mr-2"
            style={{
              fontFamily: 'var(--pixel-font)',
              color: 'rgba(129,178,217,0.35)',
              fontSize: '0.8rem',
            }}
          >
            [
          </span>

          {tabs.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`pixel-tab${activeTab === tab ? ' active' : ''}`}
            >
              {activeTab === tab ? '■' : '□'}&nbsp;{tab}
            </button>
          ))}

          <span
            className="hidden md:block select-none ml-2"
            style={{
              fontFamily: 'var(--pixel-font)',
              color: 'rgba(129,178,217,0.35)',
              fontSize: '0.8rem',
            }}
          >
            ]
          </span>
        </div>

        <div
          className="h-[2px] transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--color-primary) ${((tabs.indexOf(activeTab) + 1) / tabs.length) * 100
              }%, transparent ${((tabs.indexOf(activeTab) + 1) / tabs.length) * 100
              }%)`,
            opacity: 0.6,
          }}
        />
      </div>

      {/* ── Tab Content ───────────────────────────────────────── */}
      <section
        className="flex-grow py-24 flex items-start justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="p-12 max-w-2xl w-full text-center flex flex-col items-center"
          style={{
            background: 'rgba(181,125,125,0.05)',
            border: '2px solid rgba(129,178,217,0.18)',
            clipPath:
              'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            boxShadow:
              'inset 0 0 40px rgba(129,178,217,0.04), 0 0 30px rgba(181,125,125,0.06)',
          }}
        >
          <span className="pixel-badge mb-6">{activeTab} Module</span>

          <h2
            className="font-display font-bold mb-4"
            style={{ fontSize: '1.75rem', color: 'var(--color-text)' }}
          >
            Advanced {activeTab}
          </h2>

          <p
            className="font-sans font-light text-[16px] max-w-[480px]"
            style={{ color: 'var(--color-muted)' }}
          >
            Deploy highly scalable, resilient architecture that seamlessly
            integrates into your existing workflows without compromising on
            security or performance.
          </p>

          <div className="flex gap-6 mt-8">
            {['01', '02', '03'].map(n => (
              <span
                key={n}
                style={{
                  fontFamily: 'var(--pixel-font)',
                  fontSize: '0.6rem',
                  color: 'rgba(129,178,217,0.4)',
                  letterSpacing: '0.1em',
                }}
              >
                [{n}]
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
