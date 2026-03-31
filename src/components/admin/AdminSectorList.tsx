import { useState, useCallback } from 'react';
import { useTimelineData } from '../../context/TimelineDataContext';
import { hexToGlow } from '../../context/timeline-data-store';
import AdminSectorEditor from './AdminSectorEditor';
import AdminMilestoneList from './AdminMilestoneList';
import * as s from './admin-styles';

export default function AdminSectorList() {
  const { data, updateData } = useTimelineData();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleAddSector = useCallback(() => {
    const newId = `Sector_${Date.now()}`;
    const defaultColor = '#6b7280';
    updateData((prev) => ({
      ...prev,
      dandelions: [
        ...prev.dandelions,
        {
          sector: { id: newId, label: 'New Sector', color: defaultColor, glowColor: hexToGlow(defaultColor) },
          placement: { x: 200, y: 500, size: 300, delay: 1.0 },
        },
      ],
    }));
    setExpandedIndex(data.dandelions.length);
  }, [data.dandelions.length, updateData]);

  const handleRemoveSector = useCallback(
    (index: number) => {
      const sectorId = data.dandelions[index].sector.id;
      const milestoneCount = data.milestones.filter((m) => m.sectorId === sectorId).length;
      const msg = milestoneCount > 0
        ? `Delete "${sectorId}" and its ${milestoneCount} milestone(s)?`
        : `Delete sector "${sectorId}"?`;

      if (!confirm(msg)) return;

      updateData((prev) => ({
        ...prev,
        dandelions: prev.dandelions.filter((_, i) => i !== index),
        milestones: prev.milestones.filter((m) => m.sectorId !== sectorId),
      }));

      setExpandedIndex(null);
    },
    [data, updateData],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={s.sectionHeader}>
          Sectors ({data.dandelions.length})
        </span>
        <button
          onClick={handleAddSector}
          style={{ ...s.btnPrimary, height: 28, fontSize: 12 }}
        >
          + Add Sector
        </button>
      </div>

      {data.dandelions.map((config, i) => {
        const isExpanded = expandedIndex === i;
        const milestoneCount = data.milestones.filter(
          (m) => m.sectorId === config.sector.id,
        ).length;

        return (
          <div key={`${config.sector.id}-${i}`} style={s.card}>
            {/* Sector header row */}
            <button
              onClick={() => handleToggle(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              {/* Color dot */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: config.sector.color,
                  flexShrink: 0,
                  border: `1px solid ${s.colors.border}`,
                }}
              />

              {/* Label */}
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: s.colors.text }}>
                {config.sector.label.replace(/\n/g, ' ')}
              </span>

              {/* ID badge */}
              <span
                style={{
                  fontSize: 11,
                  color: s.colors.textMuted,
                  background: s.colors.bg,
                  padding: '2px 6px',
                  borderRadius: 3,
                }}
              >
                {config.sector.id}
              </span>

              {/* Milestone count */}
              <span style={{ fontSize: 11, color: s.colors.textMuted }}>
                {milestoneCount} milestone{milestoneCount !== 1 ? 's' : ''}
              </span>

              {/* Remove button */}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSector(i);
                }}
                style={{
                  fontSize: 12,
                  color: s.colors.textMuted,
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
                title="Delete sector"
              >
                ✕
              </span>

              {/* Chevron */}
              <span
                style={{
                  fontSize: 12,
                  color: s.colors.textMuted,
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                }}
              >
                ▼
              </span>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ borderTop: `1px solid ${s.colors.borderLight}` }}>
                <AdminSectorEditor index={i} config={config} />
                <div style={{ borderTop: `1px solid ${s.colors.borderLight}` }}>
                  <AdminMilestoneList sectorId={config.sector.id} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
