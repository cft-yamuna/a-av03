import { useState, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import FullscreenContainer from './components/shared/FullscreenContainer';
import BackgroundGradient from './components/shared/BackgroundGradient';
import AmbientScene from './components/ambient/AmbientScene';
import SectorDetailView from './components/sector/SectorDetailView';
import { CENTERED_DANDELION_SIZE } from './constants/animation';
import { useTimelineData } from './context/TimelineDataContext';
import type { AppState, SectorConfig } from './types';

gsap.registerPlugin(useGSAP);

/** Seconds of inactivity before returning from active → idle */
const INACTIVITY_TIMEOUT = 15;

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [selectedSector, setSelectedSector] = useState<SectorConfig | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentDecade, setCurrentDecade] = useState<string | null>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data } = useTimelineData();

  // ── Activity detection: idle → active on mouse/keyboard ──
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setAppState((prev) => (prev === 'active' ? 'idle' : prev));
      }, INACTIVITY_TIMEOUT * 1000);
    };

    const handleActivity = () => {
      setAppState((prev) => {
        if (prev === 'idle') return 'active';
        return prev;
      });
      resetTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  const handleSelectSector = useCallback((sector: SectorConfig, index: number) => {
    setSelectedSector(sector);
    setSelectedIndex(index);
    setAppState('sector');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedSector(null);
    setSelectedIndex(null);
    setCurrentDecade(null);
    setAppState('idle');
  }, []);

  // ── Horizontal swipe between sectors ──
  const handleSwipeSector = useCallback((direction: -1 | 1) => {
    if (selectedIndex === null) return;
    const newIndex = selectedIndex + direction;
    if (newIndex < 0 || newIndex >= data.dandelions.length) return;
    const d = data.dandelions[newIndex];
    setSelectedSector({
      id: d.sector.id as SectorConfig['id'],
      label: d.sector.label,
      color: d.sector.color,
      glowColor: d.sector.glowColor,
    });
    setSelectedIndex(newIndex);
  }, [selectedIndex, data.dandelions]);

  return (
    <FullscreenContainer>
      <BackgroundGradient sectorColor={selectedSector?.color ?? null} />
      <AmbientScene
        appState={appState}
        selectedSector={selectedSector}
        selectedIndex={selectedIndex}
        onSelectSector={handleSelectSector}
      />
      {appState === 'sector' && selectedSector && (
        <SectorDetailView
          sector={selectedSector}
          dandelionSize={CENTERED_DANDELION_SIZE}
          onBack={handleBack}
          onSwipeSector={handleSwipeSector}
          initialDecade={currentDecade}
          onDecadeChange={setCurrentDecade}
        />
      )}
    </FullscreenContainer>
  );
}
