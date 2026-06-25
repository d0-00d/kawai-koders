// client/src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = ['Nav Link 1', 'Nav Link 2', 'Nav Link 3'];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-unit-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      style={{
        background: isScrolled
          ? 'rgba(5,5,5,0.88)'
          : 'rgba(5,5,5,0.5)',
        borderBottom: `1px solid ${isScrolled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        backdropFilter: 'blur(20px) saturate(140%)',
        backgroundImage: isScrolled
          ? `repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.015) 0px,
              rgba(255,255,255,0.015) 1px,
              transparent 1px,
              transparent 4px
            )`
          : 'none',
      }}
    >
      {/* ── Logo ───────────────────────────────────────────────── */}
      <div className="flex items-center">
        <Link
          to="/"
          className="glitch-hover flex items-center gap-1"
          style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '20px',
            lineHeight: '1.3',
            letterSpacing: '-0.01em',
            color: '#ffffff',
          }}
        >
          KOHNRAD
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#81B2D9',
              marginLeft: '2px',
              marginBottom: '4px',
              opacity: 0.9,
            }}
          />
        </Link>
        <span
          className="hidden md:block ml-4 pl-4"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            borderLeft: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          Research_Lab
        </span>
      </div>

      {/* ── Centre Nav Links ───────────────────────────────────── */}
      <div className="hidden md:flex gap-unit-lg absolute left-1/2 -translate-x-1/2">
        {NAV_LINKS.map((label, i) => (
          <a
            key={label}
            href="#"
            className="flex flex-col items-center group relative"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              padding: '4px 8px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#81B2D9';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color =
                i === 0 ? '#ffffff' : 'rgba(255,255,255,0.45)';
            }}
          >
            {/* Active indicator tick */}
            <span
              aria-hidden="true"
              style={{
                display: 'block',
                width: '1px',
                height: i === 0 ? '8px' : '4px',
                background: i === 0 ? '#81B2D9' : 'rgba(255,255,255,0.18)',
                marginBottom: '4px',
                transition: 'height 0.2s ease, background 0.2s ease',
              }}
            />
            {label}
          </a>
        ))}
      </div>

      {/* ── CTA Button ─────────────────────────────────────────── */}
      <div>
        <button
          id="navbar-cta-btn"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#050505',
            background: 'rgba(255,255,255,0.90)',
            border: 'none',
            padding: '10px 24px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = '#81B2D9';
            el.style.color = '#050505';
            el.style.boxShadow = '0 0 15px rgba(129,178,217,0.35)';
            el.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'rgba(255,255,255,0.90)';
            el.style.color = '#050505';
            el.style.boxShadow = 'none';
            el.style.transform = 'translateY(0)';
          }}
        >
          CTA Action
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
