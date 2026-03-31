import { useCallback, useMemo } from 'react';
import { useTimelineData } from '../../context/TimelineDataContext';
import { yearToDecade } from '../../context/timeline-data-store';
import AdminMilestoneEditor from './AdminMilestoneEditor';
import * as s from './admin-styles';

interface AdminMilestoneListProps {
  sectorId: string;
}

export default function AdminMilestoneList({ sectorId }: AdminMilestoneListProps) {
  const { data, updateData } = useTimelineData();

  const milestones = useMemo(
    () =>
      data.milestones
        .filter((m) => m.sectorId === sectorId)
        .sort((a, b) => a.year - b.year),
    [data.milestones, sectorId],
  );

  const handleAdd = useCallback(() => {
    const nextId = `m_${Date.now()}`;
    const defaultYear = milestones.length > 0 ? milestones[milestones.length - 1].year + 1 : 2000;
    updateData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        {
          id: nextId,
          year: defaultYear,
          description: '',
          sectorId,
          decade: yearToDecade(defaultYear),
        },
      ],
    }));
  }, [milestones, sectorId, updateData]);

  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ ...s.sectionHeader, fontSize: 12 }}>
          Milestones ({milestones.length})
        </span>
        <button
          onClick={handleAdd}
          style={{ ...s.btnSmall, color: s.colors.primary, background: '#eff6ff' }}
        >
          + Add
        </button>
      </div>

      {milestones.length > 0 && (
        <div>
          {/* Header row */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            <span style={{ ...s.label, width: 64, flexShrink: 0, margin: 0 }}>Year</span>
            <span style={{ ...s.label, flex: 1, margin: 0 }}>Title</span>
            <span style={{ ...s.label, flex: 2, margin: 0 }}>Description</span>
            <span style={{ ...s.label, width: 48, flexShrink: 0, margin: 0 }}>Decade</span>
            <span style={{ width: 28, flexShrink: 0 }} />
          </div>

          {milestones.map((m) => (
            <AdminMilestoneEditor key={m.id} milestone={m} />
          ))}
        </div>
      )}

      {milestones.length === 0 && (
        <p style={{ fontSize: 12, color: s.colors.textMuted, margin: '8px 0' }}>
          No milestones for this sector yet.
        </p>
      )}
    </div>
  );
}
