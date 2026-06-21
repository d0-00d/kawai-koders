// client/src/pages/Landing.tsx
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PixelWaveBackground from '../components/PixelWaveBackground';

const tabs = ['Sub Tab 1', 'Sub Tab 2', 'Sub Tab 3', 'Sub Tab 4', 'Sub Tab 5'];

const Landing = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Navbar />

      {/* ── Hero Section ─────────────────────────────────────── */}
      <main className="relative top-0 min-h-screen flex items-center overflow-hidden">
        <PixelWaveBackground />


        <div
          className="relative z-20 container mx-auto px-8 md:px-16 pt-[56px] flex flex-col items-start text-left"
        >
          {/* Pixel-style pre-label */}
          <div
            className="pixel-badge mb-5"
            style={{ fontFamily: 'var(--pixel-font)' }}
          >
            ▸ SYSTEM READY
          </div>

          <h1
            className="font-display font-bold tracking-[0.15em] leading-none mb-6"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              color: 'var(--color-text)',
              textShadow:
                '0 0 40px rgba(129,178,217,0.25), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            KOHNRAD
          </h1>

          <p
            className="font-sans font-light text-[18px] mb-10 max-w-lg"
            style={{ color: 'var(--color-muted)' }}
          >
            Lorem ipsum your mom kinda gay
          </p>

          <button
            className="relative overflow-hidden font-medium tracking-wide uppercase text-sm px-8 py-3 transition-all duration-200"
            style={{
              fontFamily: 'var(--pixel-font)',
              color: 'var(--color-bg)',
              background: 'var(--color-primary)',
              border: 'none',
              clipPath:
                'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              boxShadow: 'var(--pixel-glow)',
              letterSpacing: '0.12em',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--pixel-glow-rose)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--pixel-glow)';
            }}
          >
            ▸ EARLY ACCESS
          </button>
        </div>
      </main>

      {/* ── Pixel-UI Tab Navigation ───────────────────────────── */}
      <div className="sticky top-[56px] z-40 w-full pixel-tab-bar">
        {/* corner-brackets decoration */}
        <div className="container mx-auto px-4 flex justify-center items-center gap-1 py-2 relative">
          {/* left bracket */}
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

          {/* right bracket */}
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

        {/* progress/indicator bar */}
        <div
          className="h-[2px] transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--color-primary) ${
              ((tabs.indexOf(activeTab) + 1) / tabs.length) * 100
            }%, transparent ${
              ((tabs.indexOf(activeTab) + 1) / tabs.length) * 100
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
            style={{
              fontSize: '1.75rem',
              color: 'var(--color-text)',
            }}
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

          {/* pixel decorative corner marks */}
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
