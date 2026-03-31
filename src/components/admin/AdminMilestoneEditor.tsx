import { useCallback } from 'react';
import { useTimelineData } from '../../context/TimelineDataContext';
import { yearToDecade } from '../../context/timeline-data-store';
import type { TimelineMilestone } from '../../types/timeline-data';
import * as s from './admin-styles';

interface AdminMilestoneEditorProps {
  milestone: TimelineMilestone;
}

export default function AdminMilestoneEditor({ milestone }: AdminMilestoneEditorProps) {
  const { updateData } = useTimelineData();

  const updateField = useCallback(
    (field: keyof TimelineMilestone, value: string | number) => {
      updateData((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestone.id
            ? {
                ...m,
                [field]: value,
                ...(field === 'year' ? { decade: yearToDecade(value as number) } : {}),
              }
            : m,
        ),
      }));
    },
    [milestone.id, updateData],
  );

  const handleDelete = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== milestone.id),
    }));
  }, [milestone.id, updateData]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        padding: '8px 0',
      }}
    >
      {/* Year */}
      <div style={{ width: 64, flexShrink: 0 }}>
        <input
          type="number"
          style={s.input}
          value={milestone.year}
          onChange={(e) => updateField('year', Number(e.target.value))}
          min={1900}
          max={2100}
        />
      </div>

      {/* Description */}
      <div style={{ flex: 3, minWidth: 0 }}>
        <input
          style={s.input}
          value={milestone.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Description"
        />
      </div>

      {/* Decade (auto) */}
      <div style={{ width: 48, flexShrink: 0 }}>
        <input
          style={{ ...s.input, color: s.colors.textMuted, background: '#f3f4f6' }}
          value={milestone.decade}
          readOnly
          title="Auto-derived from year"
        />
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        style={{
          ...s.btnSmall,
          color: s.colors.danger,
          background: 'transparent',
          flexShrink: 0,
        }}
        title="Remove milestone"
      >
        ✕
      </button>
    </div>
  );
}
