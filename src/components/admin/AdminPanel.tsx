import AdminToolbar from './AdminToolbar';
import AdminSectorList from './AdminSectorList';
import * as s from './admin-styles';

export default function AdminPanel() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: s.colors.bg,
        overflow: 'auto',
        userSelect: 'text',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: s.colors.text,
      }}
    >
      <AdminToolbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 16px 64px' }}>
        <AdminSectorList />
      </div>
    </div>
  );
}
