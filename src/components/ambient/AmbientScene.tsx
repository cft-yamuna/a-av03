import { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import FloatingDandelion from '../dandelion/FloatingDandelion';
import AmbientTitle from './AmbientTitle';
import { useTimelineData } from '../../context/TimelineDataContext';
import { ANIMATION, CENTERED_DANDELION_SIZE } from '../../constants/animation';
import { Sector } from '../../types';
import type { AppState, DandelionHandle, SectorConfig } from '../../types';

// ── Decorative (ambient-only) dandelion generation ──

/** Mulberry32 seeded PRNG — stable positions across renders */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DECORATIVE_COLOR = '#aaaaaa';
const DECORATIVE_GLOW = 'rgba(170, 170, 170, 0.25)';

const DECORATIVE_SIZES = [480, 160, 340, 190, 420, 150, 300, 130];

function generateDecorativeDandelions() {
  const rng = mulberry32(12345);
  const cols = 2;
  const rows = 4;
  const cellW = 1080 / cols;
  const cellH = 1920 / rows;

  return DECORATIVE_SIZES.map((size, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jitterX = (rng() - 0.5) * (cellW - size) * 0.6;
    const jitterY = (rng() - 0.5) * (cellH - size) * 0.6;
    const cx = col * cellW + cellW / 2 + jitterX;
    const cy = row * cellH + cellH / 2 + jitterY;
    return {
      color: DECORATIVE_COLOR,
      glowColor: DECORATIVE_GLOW,
      size,
      x: Math.round(Math.max(0, Math.min(1080 - size, cx - size / 2))),
      y: Math.round(Math.max(0, Math.min(1920 - size, cy - size / 2))),
      delay: rng() * 4,
    };
  });
}

const DECORATIVE_DANDELIONS = generateDecorativeDandelions();

// ── Cluster positions for "active" state ──
// Hand-tuned (top-left) targets that pack dandelions near screen center.
// Order matches DEFAULT_DANDELIONS: IT, Sustainability, ConsumerCare, WiN, GEJV, Foundation, General
const CLUSTER_POSITIONS = [
  { x: 430, y: 300 },   // IT (500px) — top right
  { x: 350, y: 580 },   // Sustainability (380px) — center
  { x: 370, y: 830 },   // ConsumerCare (330px) — bottom center
  { x: 120, y: 660 },   // WiN (310px) — left
  { x: 150, y: 980 },   // GEJV (220px) — bottom left
  { x: 620, y: 780 },   // Foundation (280px) — right
  { x: 80,  y: 280 },   // General (540px) — top left
];

const CLUSTER_DURATION = 1.2;
const CLUSTER_EASE = 'power2.inOut';

// ── Component ──

interface AmbientSceneProps {
  appState: AppState;
  selectedSector?: SectorConfig | null;
  selectedIndex?: number | null;
  onSelectSector?: (sector: SectorConfig, index: number) => void;
}

export default function AmbientScene({
  appState,
  selectedSector = null,
  selectedIndex = null,
  onSelectSector,
}: AmbientSceneProps) {
  const { data } = useTimelineData();
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);
  const dandelionRefs = useRef<(DandelionHandle | null)[]>([]);
  const transitioningRef = useRef(false);
  const transitionTlRef = useRef<gsap.core.Timeline | null>(null);
  const clusterTlRef = useRef<gsap.core.Timeline | null>(null);
  const decorativeWrapRef = useRef<HTMLDivElement>(null);
  const prevAppStateRef = useRef<AppState>(appState);
  const prevSelectedIndexRef = useRef<number | null>(null);

  const isActive = appState === 'active';
  const isSector = appState === 'sector';

  // ── Transition: idle ↔ active (cluster / uncluster) ──
  useEffect(() => {
    const prev = prevAppStateRef.current;
    prevAppStateRef.current = appState;

    // idle → active: cluster dandelions toward center
    if (appState === 'active' && prev === 'idle') {
      clusterTlRef.current?.kill();
      dandelionRefs.current.forEach((h) => h?.killTweens());

      const tl = gsap.timeline();
      clusterTlRef.current = tl;

      dataRef.current.dandelions.forEach((_, i) => {
        const el = dandelionRefs.current[i]?.getContainer();
        if (!el) return;
        const target = CLUSTER_POSITIONS[i];
        if (!target) return;
        tl.to(el, {
          left: target.x,
          top: target.y,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: CLUSTER_DURATION,
          ease: CLUSTER_EASE,
        }, 0);
      });

      // Dim decorative wrapper
      if (decorativeWrapRef.current) {
        tl.to(decorativeWrapRef.current, { opacity: 0.4, duration: 0.6, ease: 'power2.out' }, 0);
      }
    }

    // active → idle: uncluster back to original positions, restart wander
    if (appState === 'idle' && prev === 'active') {
      clusterTlRef.current?.kill();
      clusterTlRef.current = null;

      const tl = gsap.timeline({
        onComplete: () => {
          dandelionRefs.current.forEach((h) => h?.restartTweens());
        },
      });
      clusterTlRef.current = tl;

      dataRef.current.dandelions.forEach((d, i) => {
        const el = dandelionRefs.current[i]?.getContainer();
        if (!el) return;
        tl.to(el, {
          left: d.placement.x,
          top: d.placement.y,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          opacity: 0.85,
          duration: CLUSTER_DURATION,
          ease: CLUSTER_EASE,
          onStart: () => { el.style.pointerEvents = ''; },
        }, 0);
      });

      // Restore decorative wrapper opacity
      if (decorativeWrapRef.current) {
        tl.to(decorativeWrapRef.current, { opacity: 0.6, duration: 0.6, ease: 'power2.out' }, 0);
      }
    }
  }, [appState]);

  // ── Forward transition: active → sector  (and sector → sector on swipe) ──
  // Non-selected dandelions spread organically around the centered one.
  // Hand-tuned per-index positions (center coords), scale multipliers, and opacities
  // that preserve each dandelion's relative size and create an organic, uneven layout.
  // Order: IT, Sustainability, ConsumerCare, WiN, GEJV, Foundation, General
  const SPREAD_POSITIONS = [
    { cx: 950,  cy: 280,  s: 1.40, o: 0.30 }, // IT (500) → 700px
    { cx: 940,  cy: 700,  s: 1.35, o: 0.25 }, // Sustainability (380) → 513px
    { cx: -10,  cy: 560,  s: 1.30, o: 0.28 }, // ConsumerCare (330) → 429px
    { cx: 40,   cy: 920,  s: 1.25, o: 0.22 }, // WiN (310) → 388px
    { cx: 140,  cy: 1200, s: 1.45, o: 0.20 }, // GEJV (220) → 319px
    { cx: 960,  cy: 950,  s: 1.35, o: 0.25 }, // Foundation (280) → 378px
    { cx: -80,  cy: 160,  s: 1.05, o: 0.25 }, // General (540) → 567px, partially off-screen
  ];

  useEffect(() => {
    if (selectedSector === null) return;
    if (selectedSector.id === Sector.ViewAll) return;

    // Kill any in-flight transitions
    clusterTlRef.current?.kill();
    transitionTlRef.current?.kill();
    transitioningRef.current = true;

    const { dandelionMove } = ANIMATION.sectorTransition;

    dandelionRefs.current.forEach((h) => h?.killTweens());

    const tl = gsap.timeline({
      onComplete: () => { transitioningRef.current = false; },
    });
    transitionTlRef.current = tl;

    // Dim decorative wrapper further in sector view
    if (decorativeWrapRef.current) {
      tl.to(decorativeWrapRef.current, { opacity: 0.1, duration: 0.5, ease: 'power2.out' }, 0);
    }

    prevSelectedIndexRef.current = selectedIndex;

    if (selectedIndex !== null) {
      const selectedEl = dandelionRefs.current[selectedIndex]?.getContainer();
      const placement = dataRef.current.dandelions[selectedIndex]?.placement;

      const centeredCenterY = dandelionMove.targetY + CENTERED_DANDELION_SIZE / 2;

      if (selectedEl && placement) {
        const scaleFactor = CENTERED_DANDELION_SIZE / placement.size;
        tl.to(selectedEl, {
          left: 540 - placement.size / 2,
          top: centeredCenterY - placement.size / 2,
          x: 0,
          y: 0,
          scale: scaleFactor,
          rotation: 0,
          opacity: 1,
          duration: dandelionMove.duration,
          ease: dandelionMove.ease,
        }, 0);
      }

      // Spread non-selected dandelions to their hand-tuned positions
      dataRef.current.dandelions.forEach((_, i) => {
        if (i === selectedIndex) return;
        const el = dandelionRefs.current[i]?.getContainer();
        const p = dataRef.current.dandelions[i]?.placement;
        const sp = SPREAD_POSITIONS[i];
        if (!el || !p || !sp) return;

        el.style.pointerEvents = 'none';
        tl.to(el, {
          left: sp.cx - p.size / 2,
          top: sp.cy - p.size / 2,
          x: 0,
          y: 0,
          scale: sp.s,
          rotation: 0,
          opacity: sp.o,
          duration: dandelionMove.duration,
          ease: dandelionMove.ease,
        }, 0);
      });
    }
  }, [selectedSector, selectedIndex]);

  // ── Reverse transition: sector → idle ──
  useEffect(() => {
    if (selectedSector !== null) return;
    if (!transitionTlRef.current) return;

    prevSelectedIndexRef.current = null;
    transitioningRef.current = true;
    transitionTlRef.current?.kill();
    transitionTlRef.current = null;

    const { dandelionMove, reverse } = ANIMATION.sectorTransition;

    const tl = gsap.timeline({
      onComplete: () => {
        transitioningRef.current = false;
        transitionTlRef.current = null;
        dandelionRefs.current.forEach((h) => h?.restartTweens());
      },
    });
    transitionTlRef.current = tl;

    dandelionRefs.current.forEach((h, i) => {
      const el = h?.getContainer();
      if (!el) return;
      const placement = dataRef.current.dandelions[i]?.placement;
      if (!placement) return;
      tl.to(el, {
        left: placement.x,
        top: placement.y,
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
        opacity: 0.85,
        duration: dandelionMove.duration,
        ease: dandelionMove.ease,
        onStart: () => {
          el.style.visibility = 'visible';
          el.style.pointerEvents = '';
        },
      }, reverse.moveBackDelay);
    });

    // Restore decorative wrapper
    if (decorativeWrapRef.current) {
      gsap.to(decorativeWrapRef.current, { opacity: 0.6, duration: 0.6, ease: 'power2.out' });
    }
  }, [selectedSector]);

  const handleClick = useCallback(
    (sector: SectorConfig, index: number) => {
      if (transitioningRef.current) return;
      onSelectSector?.(sector, index);
    },
    [onSelectSector],
  );

  const makeGetOtherPositions = useCallback(
    (excludeIndex: number) => () => {
      const positions: { cx: number; cy: number }[] = [];
      dandelionRefs.current.forEach((h, i) => {
        if (i === excludeIndex) return;
        const el = h?.getContainer();
        if (!el) return;
        const left = parseFloat(el.style.left) || 0;
        const top = parseFloat(el.style.top) || 0;
        const w = parseFloat(el.style.width) || 0;
        const h2 = parseFloat(el.style.height) || 0;
        positions.push({ cx: left + w / 2, cy: top + h2 / 2 });
      });
      return positions;
    },
    [],
  );

  return (
    <>
      {/* Title — visible only when active (clustered) */}
      <AmbientTitle visible={true} />

      {/* Decorative dandelions — background layer */}
      <div
        ref={decorativeWrapRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      >
        {DECORATIVE_DANDELIONS.map((d, i) => (
          <FloatingDandelion
            key={`deco-${i}`}
            color={d.color}
            glowColor={d.glowColor}
            size={d.size}
            x={d.x}
            y={d.y}
            delay={d.delay}
            label=""
            dimmed={isSector}
          />
        ))}
      </div>

      {/* Sector dandelions — interactive layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: selectedIndex !== null ? 25 : 'auto',
        pointerEvents: selectedIndex !== null ? 'none' : 'auto',
      }}>
        {data.dandelions.map((d, i) => {
          const sectorConfig: SectorConfig = {
            id: d.sector.id as SectorConfig['id'],
            label: d.sector.label,
            color: d.sector.color,
            glowColor: d.sector.glowColor,
          };

          return (
            <FloatingDandelion
              key={d.sector.id}
              ref={(handle) => { dandelionRefs.current[i] = handle; }}
              color={d.sector.color}
              glowColor={d.sector.glowColor}
              size={d.placement.size}
              x={d.placement.x}
              y={d.placement.y}
              delay={d.placement.delay}
              label={d.sector.label}
              labelScale={
                d.sector.id === Sector.General ? 0.5
                : d.sector.id === Sector.Sustainability ? 0.5
                : d.sector.id === Sector.GEJV ? 0.5
                : d.sector.id === Sector.ConsumerCare ? 0.5
                : d.sector.id === Sector.Foundation ? 0.7
                : 1
              }
              getOtherPositions={makeGetOtherPositions(i)}
              onClick={() => handleClick(sectorConfig, i)}
              showLabel={isActive || isSector}
            />
          );
        })}
      </div>
    </>
  );
}
