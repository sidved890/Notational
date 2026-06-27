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
          }
    ),
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
  const meta = {
    name: data.meta?.name || '',
    ragam: data.meta?.ragam || '',
    composer: data.meta?.composer || '',
    talaBase: data.meta?.talaBase || (data.meta?.talam === 'adi' ? 'triputa' : data.meta?.talam || 'triputa'),
    jathi: data.meta?.jathi || 'chaturasra',
    kalai: (data.meta?.kalai === 2 ? 2 : 1) as 1 | 2,
    maatras: data.meta?.maatras || 2,
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
  }
}
