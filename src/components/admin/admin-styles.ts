import type { CSSProperties } from 'react';

// Admin design tokens — compact, professional admin dashboard style
export const colors = {
  bg: '#f8f9fa',
  surface: '#ffffff',
  border: '#e2e5e9',
  borderLight: '#eef0f2',
  text: '#1a1d21',
  textSecondary: '#5f6368',
  textMuted: '#8b9098',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  danger: '#dc2626',
  dangerHover: '#b91c1c',
  dangerBg: '#fef2f2',
  success: '#16a34a',
  inputBg: '#f8f9fa',
  inputBorder: '#d1d5db',
  inputFocus: '#2563eb',
} as const;

export const card: CSSProperties = {
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
};

export const input: CSSProperties = {
  height: 32,
  padding: '0 8px',
  fontSize: 13,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  border: `1px solid ${colors.inputBorder}`,
  borderRadius: 4,
  background: colors.inputBg,
  color: colors.text,
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
};

export const textarea: CSSProperties = {
  ...input,
  height: 'auto',
  padding: '6px 8px',
  resize: 'vertical',
  minHeight: 56,
};

export const label: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: colors.textSecondary,
  marginBottom: 3,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

export const btnPrimary: CSSProperties = {
  height: 32,
  padding: '0 12px',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#fff',
  background: colors.primary,
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  whiteSpace: 'nowrap',
};

export const btnSecondary: CSSProperties = {
  ...btnPrimary,
  color: colors.text,
  background: colors.surface,
  border: `1px solid ${colors.border}`,
};

export const btnDanger: CSSProperties = {
  ...btnPrimary,
  background: colors.danger,
};

export const btnSmall: CSSProperties = {
  height: 28,
  padding: '0 8px',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  whiteSpace: 'nowrap',
};

export const sectionHeader: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: colors.text,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const pageTitle: CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: colors.text,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
};
