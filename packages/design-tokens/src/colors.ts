/**
 * ŞehirNabız Renk Paleti ve Semantic Tema Tokenları
 * Tasarım Dili: ŞehirNabız — Urban Floating UI
 *
 * Light Theme:
 * - Primary: #14B8A6 (Turkuaz)
 * - PrimaryDark: #0F766E
 * - AccentBlue: #2563EB
 * - Background: #F6F8FB
 * - Surface: #FFFFFF
 * - TextPrimary: #0F172A
 * - TextSecondary: #64748B
 * - Border: #E2E8F0
 * - Success: #16A34A
 * - Warning: #F59E0B
 * - Error: #DC2626
 *
 * Dark Theme:
 * - Background: #0B1726
 * - Surface: #152436
 * - SurfaceElevated: #1C3044
 * - TextPrimary: #F8FAFC
 * - TextSecondary: #A9B8C8
 * - Border: #304154
 */

export const palette = {
  // Teal / Turkuaz (Ana Marka Rengi)
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Primary Teal
    600: '#0D9488',
    700: '#0F766E', // Primary Dark
    800: '#115E59',
    900: '#134E4A',
    950: '#042F2E',
  },
  // Accent Blue
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB', // Accent Blue
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  // Nötr Slate (Metin, zemin ve kenarlıklar)
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
  // Dark Theme Özel Arka Plan ve Yüzeyler
  night: {
    bg: '#0B1726',
    surface: '#152436',
    surfaceElevated: '#1C3044',
    border: '#304154',
    textSecondary: '#A9B8C8',
  },
  // Durum Renkleri
  status: {
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    info: '#2563EB',
    infoLight: '#DBEAFE',
  },
  // Backend ile 1:1 Uyumlu 11 Olay Kategorisi Renkleri
  categories: {
    TRAFFIC: '#EF4444',
    ACCIDENT: '#DC2626',
    ROAD_WORK: '#F59E0B',
    WATER_OUTAGE: '#0284C7',
    POWER_OUTAGE: '#EAB308',
    INFRASTRUCTURE: '#6366F1',
    PUBLIC_TRANSPORT: '#0D9488',
    WEATHER: '#06B6D4',
    DISASTER: '#B91C1C',
    EVENT: '#8B5CF6',
    OTHER: '#64748B',
  },
} as const;

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accentBlue: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderFocus: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  card: string;
  cardBorder: string;
  tabBarBackground: string;
  tabBarBorder: string;
  overlay: string;
}

export const lightTheme: ThemeColors = {
  primary: '#14B8A6',
  primaryLight: '#CCFBF1',
  primaryDark: '#0F766E',
  accentBlue: '#2563EB',
  background: '#F6F8FB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderFocus: '#14B8A6',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  tabBarBackground: 'rgba(255, 255, 255, 0.94)',
  tabBarBorder: 'rgba(226, 232, 240, 0.8)',
  overlay: 'rgba(15, 23, 42, 0.4)',
};

export const darkTheme: ThemeColors = {
  primary: '#2DD4BF', // Karanlık modda erişilebilir yüksek kontrast turkuaz
  primaryLight: '#134E4A',
  primaryDark: '#0F766E',
  accentBlue: '#3B82F6',
  background: '#0B1726',
  surface: '#152436',
  surfaceElevated: '#1C3044',
  text: '#F8FAFC',
  textSecondary: '#A9B8C8',
  textMuted: '#64748B',
  border: '#304154',
  borderFocus: '#2DD4BF',
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.15)',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  info: '#3B82F6',
  infoLight: 'rgba(59, 130, 246, 0.15)',
  card: '#152436',
  cardBorder: '#304154',
  tabBarBackground: 'rgba(21, 36, 54, 0.94)',
  tabBarBorder: 'rgba(48, 65, 84, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.65)',
};
