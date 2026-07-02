export const THEME_STORAGE_KEY = 'mm-theme';

export const THEME_COLOR_FIELDS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'backgroundAlt', label: 'Background Alt' },
  { key: 'surface', label: 'Surface' },
  { key: 'panel', label: 'Panel' },
  { key: 'text', label: 'Main Text' },
  { key: 'textSoft', label: 'Soft Text' }
];

export const DEFAULT_THEME_PALETTES = {
  dark: {
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    accent: '#2dd4bf',
    background: '#07111f',
    backgroundAlt: '#0b1728',
    surface: '#0e1727',
    panel: '#111c2f',
    text: '#e6eef8',
    textSoft: '#9fb0c9'
  },
  light: {
    primary: '#0284c7',
    secondary: '#0369a1',
    accent: '#0f766e',
    background: '#f3f8ff',
    backgroundAlt: '#e5f0fb',
    surface: '#ffffff',
    panel: '#eef5ff',
    text: '#0f172a',
    textSoft: '#475569'
  }
};

export const THEME_PRESETS = {
  dark: [
    {
      id: 'github-night',
      name: 'GitHub Night',
      inspiration: 'Inspired by GitHub dark style',
      palette: {
        primary: '#58a6ff',
        secondary: '#79c0ff',
        accent: '#2ea043',
        background: '#0d1117',
        backgroundAlt: '#161b22',
        surface: '#161b22',
        panel: '#1f2630',
        text: '#e6edf3',
        textSoft: '#9da7b3'
      }
    },
    {
      id: 'linear-midnight',
      name: 'Linear Midnight',
      inspiration: 'Inspired by Linear dark UI',
      palette: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#22d3ee',
        background: '#08090c',
        backgroundAlt: '#111318',
        surface: '#171a21',
        panel: '#1d2230',
        text: '#f3f5f7',
        textSoft: '#99a1ad'
      }
    },
    {
      id: 'stripe-carbon',
      name: 'Stripe Carbon',
      inspiration: 'Inspired by premium fintech dark dashboards',
      palette: {
        primary: '#635bff',
        secondary: '#7a73ff',
        accent: '#00d4ff',
        background: '#0b1020',
        backgroundAlt: '#121a2f',
        surface: '#182039',
        panel: '#202b49',
        text: '#f8fbff',
        textSoft: '#a8b4d1'
      }
    }
  ],
  light: [
    {
      id: 'notion-paper',
      name: 'Notion Paper',
      inspiration: 'Inspired by clean document-style UI',
      palette: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#0891b2',
        background: '#f7f6f3',
        backgroundAlt: '#efede8',
        surface: '#ffffff',
        panel: '#f8fafc',
        text: '#191919',
        textSoft: '#5f6368'
      }
    },
    {
      id: 'airtable-soft',
      name: 'Airtable Soft',
      inspiration: 'Inspired by bright app workspaces',
      palette: {
        primary: '#0f766e',
        secondary: '#14b8a6',
        accent: '#0ea5e9',
        background: '#f3fbfa',
        backgroundAlt: '#e8f5f3',
        surface: '#ffffff',
        panel: '#edfdf9',
        text: '#12313a',
        textSoft: '#52717a'
      }
    },
    {
      id: 'dropbox-clinic',
      name: 'Dropbox Clinic',
      inspiration: 'Inspired by polished modern SaaS light UI',
      palette: {
        primary: '#0061ff',
        secondary: '#3b82f6',
        accent: '#7c3aed',
        background: '#f5f8ff',
        backgroundAlt: '#eaf0ff',
        surface: '#ffffff',
        panel: '#eef4ff',
        text: '#102140',
        textSoft: '#52617b'
      }
    }
  ]
};

function isHexColor(value = '') {
  return /^#([0-9a-f]{6})$/i.test(String(value).trim());
}

function normalizeHex(value, fallback) {
  return isHexColor(value) ? value.toLowerCase() : fallback;
}

function hexToRgb(hex) {
  const sanitized = normalizeHex(hex, '#000000').replace('#', '');
  return {
    r: Number.parseInt(sanitized.slice(0, 2), 16),
    g: Number.parseInt(sanitized.slice(2, 4), 16),
    b: Number.parseInt(sanitized.slice(4, 6), 16)
  };
}

function withAlpha(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function contrastText(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#0f172a' : '#f8fbff';
}

export function getThemePalette(settings = {}, mode = 'dark') {
  const fallback = DEFAULT_THEME_PALETTES[mode] ?? DEFAULT_THEME_PALETTES.dark;
  const rawPalette = settings?.theme_palettes?.[mode] ?? {};
  const palette = {};

  for (const field of THEME_COLOR_FIELDS) {
    palette[field.key] = normalizeHex(rawPalette[field.key], fallback[field.key]);
  }

  return palette;
}

export function getStoredThemeMode() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(THEME_STORAGE_KEY);
}

export function persistThemeMode(mode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
}

export function applyThemeMode(mode = 'dark', settings = {}) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const palette = getThemePalette(settings, mode);
  const buttonPrimaryText = contrastText(palette.primary);
  const cardBorder = withAlpha(palette.primary, mode === 'dark' ? 0.18 : 0.14);

  root.dataset.theme = mode;
  root.style.setProperty('--bg-primary', palette.background);
  root.style.setProperty('--bg-secondary', palette.backgroundAlt);
  root.style.setProperty('--bg-radial', withAlpha(palette.primary, mode === 'dark' ? 0.14 : 0.08));
  root.style.setProperty('--text-main', palette.text);
  root.style.setProperty('--text-soft', palette.textSoft);
  root.style.setProperty('--brand-500', palette.primary);
  root.style.setProperty('--brand-400', palette.secondary);
  root.style.setProperty('--brand-300', palette.accent);
  root.style.setProperty('--brand-200', palette.secondary);
  root.style.setProperty('--glass-bg', `linear-gradient(180deg, ${withAlpha(palette.surface, mode === 'dark' ? 0.86 : 0.92)}, ${withAlpha(palette.panel, mode === 'dark' ? 0.76 : 0.84)})`);
  root.style.setProperty('--card-bg', withAlpha(palette.panel, mode === 'dark' ? 0.78 : 0.82));
  root.style.setProperty('--card-border', cardBorder);
  root.style.setProperty('--button-primary-bg', palette.primary);
  root.style.setProperty('--button-primary-hover', palette.secondary);
  root.style.setProperty('--button-primary-text', buttonPrimaryText);
  root.style.setProperty('--button-primary-border', withAlpha(palette.secondary, 0.28));
  root.style.setProperty('--button-secondary-bg', withAlpha(palette.surface, mode === 'dark' ? 0.72 : 0.88));
  root.style.setProperty('--button-secondary-hover', withAlpha(palette.panel, mode === 'dark' ? 0.9 : 0.96));
  root.style.setProperty('--button-secondary-text', palette.text);
  root.style.setProperty('--button-secondary-border', withAlpha(palette.secondary, 0.18));
  root.style.setProperty('--button-ghost-text', palette.text);
  root.style.setProperty('--button-ghost-hover', withAlpha(palette.secondary, 0.1));
  root.style.setProperty('--focus-ring', withAlpha(palette.secondary, 0.38));
  root.style.setProperty('--nav-active-bg', withAlpha(palette.primary, mode === 'dark' ? 0.18 : 0.12));
  root.style.setProperty('--nav-active-text', palette.text);
  root.style.setProperty('--nav-active-ring', withAlpha(palette.secondary, 0.28));
}
