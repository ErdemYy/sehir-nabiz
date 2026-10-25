/**
 * ŞehirNabız Renk Paleti ve Tema Tokenları
 * Türkiye kentsel dinamizmini yansıtan modern, canlı ve erişilebilir renk paleti.
 */

export const palette = {
  // Marka Ana Renkleri (Nabız Kırmızısı & Şehir Mavisi)
  crimson: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48', // Primary Pulse
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  navy: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    950: '#082F49',
  },
  // Olay Şiddeti ve Durum Renkleri
  severity: {
    low: '#10B981', // Yeşil (Düşük aciliyet)
    medium: '#F59E0B', // Kehribar (Orta)
    high: '#F97316', // Turuncu (Yüksek)
    critical: '#EF4444', // Kırmızı (Kritik / Acil)
  },
  // Kategori Renkleri
  categories: {
    traffic: '#EF4444',
    roadwork: '#F59E0B',
    accident: '#DC2626',
    infrastructure: '#3B82F6',
    event: '#8B5CF6',
    safety: '#10B981',
    other: '#6B7280',
  },
  // Nötr Renkler
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
} as const;

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  card: string;
}

export const lightTheme: ThemeColors = {
  primary: palette.crimson[600],
  primaryLight: palette.crimson[100],
  primaryDark: palette.crimson[800],
  background: '#FFFFFF',
  surface: palette.slate[50],
  surfaceElevated: '#FFFFFF',
  text: palette.slate[900],
  textSecondary: palette.slate[600],
  textMuted: palette.slate[400],
  border: palette.slate[200],
  borderFocus: palette.crimson[500],
  error: palette.severity.critical,
  success: palette.severity.low,
  warning: palette.severity.medium,
  info: palette.navy[500],
  card: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  primary: palette.crimson[500],
  primaryLight: palette.crimson[900],
  primaryDark: palette.crimson[400],
  background: palette.slate[950],
  surface: palette.slate[900],
  surfaceElevated: palette.slate[800],
  text: palette.slate[50],
  textSecondary: palette.slate[300],
  textMuted: palette.slate[500],
  border: palette.slate[800],
  borderFocus: palette.crimson[400],
  error: palette.severity.critical,
  success: palette.severity.low,
  warning: palette.severity.medium,
  info: palette.navy[400],
  card: palette.slate[900],
};
