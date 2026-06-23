// client/src/components/GallerySignifier.tsx
import { useState, useRef, useCallback } from 'react';

const PLACEHOLDER_SECTIONS = [
  {
    label: 'Overview',
    heading: 'System Architecture',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vehicula felis nec enim convallis, at posuere nisi faucibus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Duis euismod nibh ac ligula tincidunt.',
  },
  {
    label: 'Integration',
    heading: 'Protocol Specification',
    body: 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Sed auctor metus sit amet tincidunt viverra. Turpis sapien fermentum eros at faucibus diam. Curabitur fringilla diam a velit tempus, vel commodo enim aliquet.',
  },
  {
    label: 'Performance',
    heading: 'Signal Integrity',
    body: 'Morbi at felis sed nunc tempus volutpat. Donec gravida libero ut sapien varius, non pretium metus scelerisque. Aliquam erat volutpat. Nam interdum, ex at aliquet tristique, ligula purus suscipit ipsum, ut cursus felis dui eget est.',
  },
];

const GallerySignifier = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggle = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen((prev) => !prev);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 420);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id="gallery-signifier"
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        position: 'fixed',
        top: '80px',        /* below navbar */
        right: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'row-reverse', /* button on the right */
        alignItems: 'flex-start',
      }}
    >
      {/* ── Signifier Tab (right edge) ───────────────────────── */}
      <button
        id="gallery-signifier-btn"
        aria-label="Toggle info panel"
        onClick={handleToggle}
        style={{
          flexShrink: 0,
          width: '36px',
          height: '72px',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: '6px 0 0 6px',
          background: isOpen
            ? 'rgba(129,178,217,0.14)'
            : 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(14px) saturate(120%)',
          boxShadow: isOpen
            ? '-2px 0 0 0 rgba(129,178,217,0.55), 0 4px 20px rgba(0,0,0,0.30)'
            : '-1px 0 0 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.22)',
          outline: 'none',
          transition:
            'background 0.22s ease, box-shadow 0.22s ease',
          zIndex: 2,
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(129,178,217,0.10)';
            e.currentTarget.style.boxShadow =
              '-1px 0 0 0 rgba(129,178,217,0.35), 0 4px 20px rgba(0,0,0,0.28)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.boxShadow =
              '-1px 0 0 0 rgba(255,255,255,0.12), 0 4px 16px rgba(0,0,0,0.22)';
          }
        }}
      >
        {/* SVG chevron-pair — rotates when open */}
        <svg
          width="14"
          height="22"
          viewBox="0 0 14 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* First chevron */}
          <path
            d="M3 4L10 11L3 18"
            stroke={isOpen ? '#81B2D9' : 'rgba(217,225,233,0.60)'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Second chevron — offset right */}
          <path
            d="M7 4L14 11L7 18"
            stroke={isOpen ? 'rgba(129,178,217,0.45)' : 'rgba(217,225,233,0.28)'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: 'translateX(-4px)' }}
          />
        </svg>
      </button>

      {/* ── Text Panel (slides in from right) ────────────────── */}
      <div
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateX(0)' : 'translateX(18px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition:
            'opacity 0.38s cubic-bezier(0.16,1,0.3,1), transform 0.38s cubic-bezier(0.16,1,0.3,1)',
          transformOrigin: 'right top',

          width: '420px',
          maxHeight: '68vh',
          overflowY: 'auto',

          /* Clean professional card */
          background: 'rgba(18, 22, 30, 0.82)',
          backdropFilter: 'blur(22px) saturate(130%)',
          borderRadius: '8px 0 0 8px',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRight: 'none',
          boxShadow:
            '-4px 4px 40px rgba(0,0,0,0.40), -1px 0 0 0 rgba(129,178,217,0.18)',
          padding: '28px 24px 28px 28px',

          scrollbarWidth: 'thin' as const,
          scrollbarColor: 'rgba(255,255,255,0.10) transparent',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '22px',
            paddingBottom: '14px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            {/* Subtle status dot */}
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(129,178,217,0.85)',
                boxShadow: '0 0 6px rgba(129,178,217,0.55)',
                flexShrink: 0,
                animation: 'pulse-breathe 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.10em',
                color: 'rgba(217,225,233,0.45)',
                textTransform: 'uppercase',
              }}
            >
              Documentation
            </span>
          </div>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              fontWeight: 500,
              color: 'rgba(129,178,217,0.38)',
              letterSpacing: '0.06em',
            }}
          >
            Rev 2.4.1
          </span>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {PLACEHOLDER_SECTIONS.map((section, idx) => (
            <div key={idx}>
              {/* Pill label */}
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(129,178,217,0.70)',
                  background: 'rgba(129,178,217,0.08)',
                  border: '1px solid rgba(129,178,217,0.18)',
                  borderRadius: '3px',
                  padding: '2px 7px',
                  marginBottom: '8px',
                }}
              >
                {section.label}
              </span>

              {/* Heading */}
              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'rgba(220,220,221,0.92)',
                  margin: '0 0 9px',
                  lineHeight: 1.35,
                  letterSpacing: '-0.01em',
                }}
              >
                {section.heading}
              </h3>

              {/* Body */}
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13.5px',
                  lineHeight: 1.72,
                  color: 'rgba(217,225,233,0.52)',
                  margin: 0,
                  letterSpacing: '0.01em',
                }}
              >
                {section.body}
              </p>

              {/* Divider between sections */}
              {idx < PLACEHOLDER_SECTIONS.length - 1 && (
                <div
                  aria-hidden="true"
                  style={{
                    marginTop: '24px',
                    height: '1px',
                    background: 'rgba(255,255,255,0.06)',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              color: 'rgba(217,225,233,0.22)',
              letterSpacing: '0.05em',
            }}
          >
            Kohnrad Platform
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              color: 'rgba(129,178,217,0.30)',
              letterSpacing: '0.05em',
            }}
          >
            © 2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default GallerySignifier;
