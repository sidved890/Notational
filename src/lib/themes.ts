export const THEME_KEY = 'notational_theme'
const LEGACY_DARK_KEY = 'notational_dark'

export const THEMES = [
  { id: 'parchment', label: 'Parchment', swatch: '#F5EFE0', accent: '#6B1E2E' },
  { id: 'midnight', label: 'Midnight', swatch: '#1A1208', accent: '#C9973A' },
  { id: 'forest', label: 'Forest', swatch: '#E8F0E6', accent: '#2D4A32' },
  { id: 'ocean', label: 'Ocean', swatch: '#E8F2F5', accent: '#1A3D4F' },
  { id: 'slate', label: 'Slate', swatch: '#F0F2F5', accent: '#3D4451' },
  { id: 'rosewood', label: 'Rosewood', swatch: '#FAF0F0', accent: '#7A2838' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

export function isThemeId(value: string): value is ThemeId {
  return THEMES.some((t) => t.id === value)
}

export function loadTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && isThemeId(saved)) return saved
    if (localStorage.getItem(LEGACY_DARK_KEY) === 'true') return 'midnight'
  } catch {
    // ignore
  }
  return 'parchment'
}

export function saveTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
    localStorage.removeItem(LEGACY_DARK_KEY)
  } catch {
    // ignore
  }
}

export function applyTheme(theme: ThemeId): void {
  if (typeof document === 'undefined') return
  const body = document.body
  for (const t of THEMES) {
    body.classList.remove(`theme-${t.id}`)
  }
  body.classList.add(`theme-${theme}`)
  body.dataset.theme = theme
}
