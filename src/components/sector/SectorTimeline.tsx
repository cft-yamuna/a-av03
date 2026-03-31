import { useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import TimelineEntry from './TimelineEntry';
import { useTimelineData } from '../../context/TimelineDataContext';
import { ANIMATION } from '../../constants/animation';
import { Sector } from '../../types';
import type { SectorConfig } from '../../types';
import { SECTOR_CONFIGS } from '../../data/sectors';

const SCROLL_PADDING = 60;

export interface StemConfig {
  xCenter: number;
  color: string;
  sectorId?: string;
  topY?: number;
}

interface SectorTimelineProps {
  sector: SectorConfig;
  dandelionSize: number;
  decadeRange?: { startYear: number; endYear: number } | null;
  stems?: StemConfig[];
  visibleSectorIds?: string[];
  overrideCenterY?: number;
  initialDecade?: string | null;
  onDecadeChange?: (decade: string) => void;
}

export default function SectorTimeline({
  sector,
  dandelionSize,
  decadeRange = null,
  stems,
  visibleSectorIds,
  overrideCenterY,
  initialDecade = null,
  onDecadeChange,
}: SectorTimelineProps) {
  const { data } = useTimelineData();
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isViewAll = sector.id === Sector.ViewAll;

  const sectorColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of data.dandelions) map[d.sector.id] = d.sector.color;
    for (const s of SECTOR_CONFIGS) { if (!map[s.id]) map[s.id] = s.color; }
    return map;
  }, [data.dandelions]);

  const filteredMilestones = useMemo(
    () =>
      data.milestones
        .filter((m) => {
          const sectorMatch = visibleSectorIds
            ? visibleSectorIds.includes(m.sectorId)
            : (isViewAll || m.sectorId === sector.id);
          const decadeMatch = !decadeRange || (m.year >= decadeRange.startYear && m.year < decadeRange.endYear);
          return sectorMatch && decadeMatch;
        })
        .sort((a, b) => a.year - b.year),
    [data.milestones, sector.id, isViewAll, decadeRange, visibleSectorIds],
  );

  const dandelionCenterY = overrideCenterY ??
    (ANIMATION.sectorTransition.dandelionMove.targetY + dandelionSize / 2);

  const effectiveStems: StemConfig[] = useMemo(
    () => stems ?? [{ xCenter: 540, color: sector.color }],
    [stems, sector.color],
  );

  const stemBySector = useMemo(() => {
    const map: Record<string, StemConfig> = {};
    for (const stem of effectiveStems) {
      if (stem.sectorId) map[stem.sectorId] = stem;
    }
    return map;
  }, [effectiveStems]);

  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animTlRef = useRef<gsap.core.Timeline | null>(null);
  const fadeTop = dandelionSize / 2;
  const maskGradient = `linear-gradient(to bottom, transparent 0%, black ${fadeTop}px, black 90%, transparent 100%)`;

  // Hide entries + stem immediately on sector change (before browser paints)
  useLayoutEffect(() => {
    const validLines = lineRefs.current.filter(Boolean);
    const validEntries = entryRefs.current.filter(Boolean);
    if (validLines.length > 0) gsap.set(validLines, { scaleY: 0, transformOrigin: 'top center' });
    if (validEntries.length > 0) gsap.set(validEntries, { opacity: 0, y: 0 });

    // Disable overflow clipping during animation so entries are visible sliding in
    const container = contentRef.current;
    if (container) {
      container.style.overflow = 'visible';
      container.style.maskImage = 'none';
      container.style.webkitMaskImage = 'none';
    }
  }, [sector.id]);

  // Animate: dandelion centers → stem grows → entries slide up one by one from the bottom
  useEffect(() => {
    animTlRef.current?.kill();

    // Wait for dandelion to finish centering (0.8s) before stem starts
    const startDelay = ANIMATION.sectorTransition.dandelionMove.duration;

    const frameId = requestAnimationFrame(() => {
      const validLines = lineRefs.current.filter(Boolean);
      const validEntries = entryRefs.current.filter(Boolean);
      const container = contentRef.current;

      const tl = gsap.timeline({ delay: startDelay });
      animTlRef.current = tl;

      // 1. Stem grows from dandelion center to bottom
      if (validLines.length > 0) {
        tl.to(validLines, {
          scaleY: 1,
          duration: 0.6,
          ease: 'power1.out',
        });
      }

      // 2. After stem finishes, entries appear one by one from the bottom of the screen
      //    Each entry starts far below and slides up to its natural position
      if (validEntries.length > 0) {
        // Set all entries below the visible area
        gsap.set(validEntries, { opacity: 0, y: 1200 });

        tl.to(validEntries, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          onComplete: () => {
            // Re-enable scrolling + mask after animation
            if (container) {
              container.style.overflow = '';
              container.style.overflowY = 'auto';
              container.style.overflowX = 'hidden';
              container.style.maskImage = maskGradient;
              container.style.webkitMaskImage = maskGradient;
            }
          },
        }, '>');
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      animTlRef.current?.kill();
    };
  }, [sector.id]);

  // Scroll to initialDecade milestone ONLY when sector changes (not on every decade update)
  const initialDecadeRef = useRef(initialDecade);
  initialDecadeRef.current = initialDecade;
  const prevSectorRef = useRef(sector.id);

  useEffect(() => {
    if (prevSectorRef.current === sector.id) return;
    prevSectorRef.current = sector.id;

    const decade = initialDecadeRef.current;
    if (!decade || !contentRef.current) return;

    // Defer to next frame so DOM has rendered
    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      const idx = filteredMilestones.findIndex(m => m.decade === decade);
      if (idx <= 0) return;
      const entryEls = contentRef.current.querySelectorAll('[data-milestone]');
      const target = entryEls[idx] as HTMLElement | undefined;
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    });
  }, [sector.id, filteredMilestones]);

  // Report current decade based on scroll position
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !onDecadeChange) return;

    const handleScroll = () => {
      const viewportCenter = el.scrollTop + el.clientHeight / 3;
      const entries = el.querySelectorAll('[data-milestone]');
      let closestDecade = '';
      let closestDist = Infinity;
      entries.forEach((entry) => {
        const htmlEntry = entry as HTMLElement;
        const dist = Math.abs(htmlEntry.offsetTop - viewportCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestDecade = htmlEntry.dataset.decade ?? '';
        }
      });
      if (closestDecade) onDecadeChange(closestDecade);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [onDecadeChange, sector.id]);

  return (
    <div ref={wrapperRef} style={{ position: 'absolute', inset: 0 }}>
      {/* Vertical stem */}
      {effectiveStems.map((stem, si) => (
        <div
          key={si}
          ref={(el) => { lineRefs.current[si] = el; }}
          style={{
            position: 'absolute',
            left: stem.xCenter,
            top: stem.topY ?? dandelionCenterY,
            bottom: 0,
            width: 3,
            marginLeft: -1.5,
            background: `linear-gradient(180deg, ${stem.color} 0%, ${stem.color}66 80%, transparent 100%)`,
            zIndex: 2,
          }}
        />
      ))}

      {/* All milestones — always present, free scroll */}
      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          top: dandelionCenterY,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: `${dandelionSize / 2 + 30}px ${SCROLL_PADDING}px 0`,
          zIndex: 20,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          maskImage: maskGradient,
          WebkitMaskImage: maskGradient,
        }}
      >
        {filteredMilestones.map((milestone, i) => {
          const stem = stemBySector[milestone.sectorId];
          return (
            <div
              key={milestone.id}
              ref={(el) => { entryRefs.current[i] = el; }}
              data-milestone
              data-decade={milestone.decade}
            >
              <TimelineEntry
                milestone={milestone}
                color={sectorColorMap[milestone.sectorId] ?? sector.color}
                isFocused={true}
                stemXCenter={stem?.xCenter}
              />
            </div>
          );
        })}

        <div style={{ height: 60, flexShrink: 0 }} />
      </div>
    </div>
  );
}
