import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface BackButtonProps {
  onBack: () => void;
  color: string;
}

export default function BackButton({ onBack, color }: BackButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    const el = btnRef.current;
    if (!el) return;

    gsap.fromTo(el,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, delay: 0.8, ease: 'power2.out' },
    );
  }, { scope: btnRef });

  return (
    <button
      ref={btnRef}
      onClick={onBack}
      style={{
        position: 'absolute',
        top: 40,
        left: 40,
        zIndex: 30,
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
      }}
      aria-label="Back to overview"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );
}
