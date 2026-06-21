// client/src/components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-[56px] z-50 flex items-center justify-between px-8 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled
          ? 'backdrop-blur-[14px] backdrop-saturate-[140%]'
          : 'backdrop-blur-none'
      }`}
      style={{
        background: isScrolled
          ? 'rgba(20,5,1,0.82)'
          : 'transparent',
        borderBottom: isScrolled
          ? '2px solid rgba(129,178,217,0.22)'
          : '2px solid transparent',
        boxShadow: isScrolled
          ? '0 4px 24px rgba(20,5,1,0.6), 0 0 0 0.5px rgba(129,178,217,0.08)'
          : 'none',
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
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex items-center">
        <Link
          to="/"
          className="text-2xl font-bold tracking-[0.12em] font-display uppercase"
          style={{
            color: 'var(--color-text)',
            textShadow: '0 0 20px rgba(129,178,217,0.3)',
          }}
        >
          Kohnrad
        </Link>
      </div>

      {/* ── Centre nav links (pixel style) ────────────────────── */}
      <div
        className="hidden md:flex space-x-6 absolute left-1/2 transform -translate-x-1/2"
        style={{ fontFamily: 'var(--pixel-font)' }}
      >
        {['Sub Tab 1', 'Sub Tab 2', 'Sub Tab 3', 'Sub Tab 4', 'Sub Tab 5'].map(
          (label) => (
            <span
              key={label}
              className="cursor-pointer text-[0.65rem] uppercase tracking-[0.12em] transition-all duration-200"
              style={{ color: 'rgba(217,225,233,0.55)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLSpanElement).style.color =
                  'var(--color-primary)';
                (e.currentTarget as HTMLSpanElement).style.textShadow =
                  '0 0 10px rgba(129,178,217,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLSpanElement).style.color =
                  'rgba(217,225,233,0.55)';
                (e.currentTarget as HTMLSpanElement).style.textShadow = 'none';
              }}
            >
              {label}
            </span>
          ),
        )}
      </div>

      {/* ── Sign-In (pixel button) ─────────────────────────────── */}
      <div className="flex items-center">
        <button
          id="navbar-signin-btn"
          onClick={() => navigate('/signin')}
          className="text-[0.65rem] uppercase tracking-[0.12em] px-5 py-2 transition-all duration-200"
          style={{
            fontFamily: 'var(--pixel-font)',
            color: 'var(--color-primary)',
            background: 'transparent',
            border: '2px solid rgba(129,178,217,0.5)',
            clipPath:
              'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'var(--color-primary)';
            el.style.color = 'var(--color-bg)';
            el.style.boxShadow = 'var(--pixel-glow)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'transparent';
            el.style.color = 'var(--color-primary)';
            el.style.boxShadow = 'none';
          }}
        >
          ▸ Sign In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
