import { CompositionState, CompositionRow } from './types'

const AUTOSAVE_KEY = 'notational_autosave'
const DARK_MODE_KEY = 'notational_dark'

export function autosave(state: CompositionState): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(serializeState(state)))
  } catch {
    // Ignore storage errors
  }
}

export function loadAutosave(): CompositionState | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    return deserializeState(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveDarkMode(dark: boolean): void {
  try {
    localStorage.setItem(DARK_MODE_KEY, String(dark))
  } catch {
    // Ignore
  }
}

export function loadDarkMode(): boolean {
  try {
    return localStorage.getItem(DARK_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeState(state: CompositionState): Record<string, any> {
  const notRows = state.rows.filter((r) => r.type === 'notation')
  return {
    version: 3,
    meta: { ...state.meta },
    rows: state.rows.map((r) =>
      r.type === 'heading'
        ? { type: 'heading', label: r.label }
        : {
            type: 'notation',
            cells: r.cells.map((c) => ({ swara: c.swara || '', sahitya: c.sahitya || '' })),
            sangathiNumber: r.sangathiNumber,
          }
    ),
    isPublic: state.isPublic,
    shareId: state.shareId,
    cloudId: state.cloudId,
    // Backward-compat fields
    avartanamCount: notRows.length,
    grid: notRows.map((r) =>
      r.type === 'notation'
        ? r.cells.map((c) => ({ swara: c.swara || '', sahitya: c.sahitya || '' }))
        : []
    ),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeState(data: Record<string, any>): CompositionState {
  // Handle legacy talam string -> talaBase mapping
  const LEGACY: Record<string, { talaBase: string; jathi: string }> = {
    adi: { talaBase: 'triputa', jathi: 'chaturasra' },
    rupaka: { talaBase: 'rupaka', jathi: 'chaturasra' },
    misra: { talaBase: 'misra_chapu', jathi: 'chaturasra' },
    khanda: { talaBase: 'khanda_chapu', jathi: 'chaturasra' },
    tisra: { talaBase: 'eka', jathi: 'tisra' },
    chatusra: { talaBase: 'eka', jathi: 'chaturasra' },
  }
  const legacy = data.meta?.talam ? (LEGACY[data.meta.talam] || { talaBase: 'triputa', jathi: 'chaturasra' }) : null

  const meta = {
    name: data.meta?.name || data.name || '',
    ragam: data.meta?.ragam || data.ragam || '',
    composer: data.meta?.composer || data.composer || '',
    talaBase: data.meta?.talaBase || data.talaBase || legacy?.talaBase || 'triputa',
    jathi: data.meta?.jathi || data.jathi || legacy?.jathi || 'chaturasra',
    kalai: ((data.meta?.kalai || data.kalai) === 2 ? 2 : 1) as 1 | 2,
    maatras: data.meta?.maatras || data.maatras || 2,
    // Raga info
    melakarta: data.meta?.melakarta || data.melakarta || '',
    arohanam: data.meta?.arohanam || data.arohanam || '',
    avarohanam: data.meta?.avarohanam || data.avarohanam || '',
    isJanya: data.meta?.isJanya || data.isJanya || false,
    janyaParent: data.meta?.janyaParent || data.janyaParent || '',
  }

  let rows: CompositionRow[]

  if (data.rows) {
    rows = data.rows.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (r: any): CompositionRow =>
        r.type === 'heading'
          ? { type: 'heading', label: r.label || '' }
          : {
              type: 'notation',
              cells: (r.cells || []).map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (c: any) => ({ swara: c.swara || '', sahitya: c.sahitya || '' })
              ),
              sangathiNumber: r.sangathiNumber,
            }
    )
  } else if (data.grid) {
    const count = data.avartanamCount || data.grid.length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows = data.grid.slice(0, count).map((cells: any[]) => ({
      type: 'notation' as const,
      cells: cells.map((c) => ({ swara: c.swara || '', sahitya: c.sahitya || '' })),
    }))
  } else {
    rows = Array.from({ length: 4 }, () => ({ type: 'notation' as const, cells: [] }))
  }

  return {
    meta,
    rows,
    cloudId: data.cloudId || null,
    isPublic: data.isPublic || false,
    shareId: data.shareId || undefined,
  }
}
