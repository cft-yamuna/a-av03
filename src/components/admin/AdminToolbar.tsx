import { useCallback, useRef } from 'react';
import { useTimelineData } from '../../context/TimelineDataContext';
import { exportJson, importJson } from '../../context/timeline-data-store';
import * as s from './admin-styles';

export default function AdminToolbar() {
  const { data, updateData, resetToDefaults } = useTimelineData();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const json = exportJson(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wipro-timeline-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handleImport = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = importJson(reader.result as string);
          updateData(() => imported);
        } catch {
          alert('Invalid JSON file. Please check the format.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [updateData],
  );

  const handleReset = useCallback(() => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  }, [resetToDefaults]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderBottom: `1px solid ${s.colors.border}`,
        background: s.colors.surface,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => { window.location.hash = ''; }}
        style={{ ...s.btnSecondary }}
      >
        ← Timeline
      </button>

      <h1 style={{ ...s.pageTitle, flex: 1, marginLeft: 8 }}>
        Timeline Editor
      </h1>

      <button onClick={handleExport} style={s.btnSecondary}>
        Export JSON
      </button>
      <button onClick={handleImport} style={s.btnSecondary}>
        Import JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleReset}
        style={{ ...s.btnSmall, color: s.colors.danger, background: s.colors.dangerBg }}
      >
        Reset Defaults
      </button>
    </div>
  );
}
