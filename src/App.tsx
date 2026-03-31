import { useState, useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import FullscreenContainer from './components/shared/FullscreenContainer';
import BackgroundGradient from './components/shared/BackgroundGradient';
import AmbientScene from './components/ambient/AmbientScene';
import SectorDetailView from './components/sector/SectorDetailView';
import { CENTERED_DANDELION_SIZE } from './constants/animation';
import { useTimelineData } from './context/TimelineDataContext';
import { usePresenceSensor } from './hooks/usePresenceSensor';
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
  const { isPresent, sensorConnected, connectHardware, error } = usePresenceSensor({ enabled: true });

  // Sensor-driven: wake on presence, idle on sensor clear after timeout.
  useEffect(() => {
    if (!sensorConnected) return;

    if (isPresent) {
      setAppState((prev) => (prev === 'idle' ? 'active' : prev));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    } else {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setAppState((prev) => (prev === 'active' ? 'idle' : prev));
      }, INACTIVITY_TIMEOUT * 1000);
    }
  }, [isPresent, sensorConnected]);

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
      {!sensorConnected && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
        }}>
          <button
            onClick={connectHardware}
            style={{
              background: 'rgba(255, 60, 60, 0.85)',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'sans-serif',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Connect Sensor
          </button>
          {error && (
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              color: '#ffaaaa',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 10,
              maxWidth: 200,
              textAlign: 'right',
            }}>
              {error}
            </div>
          )}
        </div>
      )}
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
