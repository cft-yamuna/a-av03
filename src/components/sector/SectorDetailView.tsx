import { useRef, useMemo, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import BackButton from './BackButton';
import SectorTimeline from './SectorTimeline';
import type { SectorConfig } from '../../types';

/** Minimum horizontal distance (px) for a swipe to register */
const SWIPE_THRESHOLD = 80;

interface SectorDetailViewProps {
  sector: SectorConfig;
  dandelionSize: number;
  onBack: () => void;
  /** Optional decade year range for filtering milestones */
  decadeRange?: { startYear: number; endYear: number } | null;
  /** Called with -1 (prev) or 1 (next) when user swipes horizontally */
  onSwipeSector?: (direction: -1 | 1) => void;
  /** Decade to start at when switching sectors (e.g. "1945") */
  initialDecade?: string | null;
  /** Called when visible decade changes */
  onDecadeChange?: (decade: string) => void;
}

export default function SectorDetailView({
  sector,
  dandelionSize,
  onBack,
  decadeRange = null,
  onSwipeSector,
  initialDecade = null,
  onDecadeChange,
}: SectorDetailViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    gsap.fromTo(el,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, delay: 0.5, ease: 'power2.out' },
    );
  }, { scope: containerRef });

  // ── Horizontal swipe detection (touch + mouse drag) ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only fire if primarily horizontal
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
        onSwipeSector?.(dx > 0 ? -1 : 1);
      }
    };

    // Mouse drag for desktop testing
    let mouseStartX = 0;
    let mouseDown = false;

    const onMouseDown = (e: MouseEvent) => {
      mouseStartX = e.clientX;
      mouseDown = true;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!mouseDown) return;
      mouseDown = false;
      const dx = e.clientX - mouseStartX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        onSwipeSector?.(dx > 0 ? -1 : 1);
      }
    };

    // Keyboard left/right arrows
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onSwipeSector?.(-1);
      if (e.key === 'ArrowRight') onSwipeSector?.(1);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onSwipeSector]);

  const timelineProps = useMemo(() => ({ dandelionSize }), [dandelionSize]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        opacity: 0,
        pointerEvents: 'auto',
      }}
    >
      <BackButton onBack={onBack} color={sector.color} />
      <SectorTimeline
        sector={sector}
        dandelionSize={timelineProps.dandelionSize}
        decadeRange={decadeRange}
        initialDecade={initialDecade}
        onDecadeChange={onDecadeChange}
      />
    </div>
  );
}
