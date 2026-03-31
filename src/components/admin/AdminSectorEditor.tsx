import { useCallback } from 'react';
import { useTimelineData } from '../../context/TimelineDataContext';
import { hexToGlow } from '../../context/timeline-data-store';
import type { DandelionConfig } from '../../types/timeline-data';
import * as s from './admin-styles';

interface AdminSectorEditorProps {
  index: number;
  config: DandelionConfig;
}

export default function AdminSectorEditor({ index, config }: AdminSectorEditorProps) {
  const { updateData } = useTimelineData();

  const updateSector = useCallback(
    (field: string, value: string) => {
      updateData((prev) => ({
        ...prev,
        dandelions: prev.dandelions.map((d, i) =>
          i === index
            ? {
                ...d,
                sector: {
                  ...d.sector,
                  [field]: value,
                  ...(field === 'color' ? { glowColor: hexToGlow(value) } : {}),
                },
              }
            : d,
        ),
      }));
    },
    [index, updateData],
  );

  const updatePlacement = useCallback(
    (field: string, value: number) => {
      updateData((prev) => ({
        ...prev,
        dandelions: prev.dandelions.map((d, i) =>
          i === index
            ? { ...d, placement: { ...d.placement, [field]: value } }
            : d,
        ),
      }));
    },
    [index, updateData],
  );

  const updateSectorId = useCallback(
    (newId: string) => {
      const oldId = config.sector.id;
      updateData((prev) => ({
        ...prev,
        dandelions: prev.dandelions.map((d, i) =>
          i === index ? { ...d, sector: { ...d.sector, id: newId } } : d,
        ),
        // Also update all milestones referencing the old sector id
        milestones: prev.milestones.map((m) =>
          m.sectorId === oldId ? { ...m, sectorId: newId } : m,
        ),
      }));
    },
    [index, config.sector.id, updateData],
  );

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Row 1: ID + Label + Color */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <span style={s.label}>Sector ID</span>
          <input
            style={s.input}
            value={config.sector.id}
            onChange={(e) => updateSectorId(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <span style={s.label}>Label</span>
          <input
            style={s.input}
            value={config.sector.label.replace(/\n/g, '\\n')}
            onChange={(e) => updateSector('label', e.target.value.replace(/\\n/g, '\n'))}
            placeholder="Use \n for line breaks"
          />
        </div>
        <div style={{ width: 100 }}>
          <span style={s.label}>Color</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={config.sector.color}
              onChange={(e) => updateSector('color', e.target.value)}
              style={{ width: 32, height: 32, border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
            />
            <input
              style={{ ...s.input, width: 80 }}
              value={config.sector.color}
              onChange={(e) => updateSector('color', e.target.value)}
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Placement values */}
      <div>
        <span style={{ ...s.label, marginBottom: 6 }}>Placement</span>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['x', 'y', 'size', 'delay'] as const).map((field) => (
            <div key={field} style={{ flex: 1 }}>
              <span style={{ ...s.label, fontSize: 10, textTransform: 'uppercase' }}>{field}</span>
              <input
                type="number"
                style={s.input}
                value={config.placement[field]}
                onChange={(e) => updatePlacement(field, Number(e.target.value))}
                step={field === 'delay' ? 0.1 : 10}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Glow color preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...s.label, margin: 0 }}>Glow</span>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: config.sector.glowColor,
            border: `1px solid ${s.colors.border}`,
          }}
        />
        <span style={{ fontSize: 11, color: s.colors.textMuted }}>{config.sector.glowColor}</span>
      </div>
    </div>
  );
}
