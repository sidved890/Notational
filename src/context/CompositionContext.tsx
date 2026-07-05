'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import { CompositionState, CompositionMeta, CompositionRow } from '@/lib/types'
import { getCellCount } from '@/lib/tala'
import { autosave, loadAutosave } from '@/lib/storage'

type Action =
  | { type: 'UPDATE_META'; payload: Partial<CompositionMeta> }
  | { type: 'UPDATE_CELL'; rowIndex: number; cellIndex: number; field: 'swara' | 'sahitya'; value: string }
  | { type: 'ADD_ROW' }
  | { type: 'ADD_HEADING' }
  | { type: 'INSERT_HEADING_BEFORE'; rowIndex: number }
  | { type: 'INSERT_ROW_AFTER'; rowIndex: number }
  | { type: 'DELETE_ROW'; rowIndex: number }
  | { type: 'UPDATE_HEADING'; rowIndex: number; label: string }
  | { type: 'MOVE_ROW'; rowIndex: number; direction: 'up' | 'down' }
  | { type: 'SET_SANGATHI'; rowIndex: number; sangathiNumber: number | undefined }
  | { type: 'DUPLICATE_AS_SANGATHI'; rowIndex: number }
  | { type: 'FILL_ROW_GAPS'; rowIndex: number; field: 'swara' | 'sahitya'; value: string }
  | { type: 'LOAD_COMPOSITION'; state: CompositionState }
  | { type: 'SET_CLOUD_ID'; cloudId: string }
  | { type: 'SET_PUBLIC'; isPublic: boolean; shareId?: string }
  | { type: 'NEW_COMPOSITION' }
  | { type: 'UNDO' }
  | { type: 'REDO' }

export const DEFAULT_META: CompositionMeta = {
  name: '',
  ragam: '',
  composer: '',
  talaBase: 'triputa',
  jathi: 'chaturasra',
  kalai: 1,
  maatras: 2,
}

function makeEmptyRow(cellCount: number): CompositionRow {
  return {
    type: 'notation',
    cells: Array.from({ length: cellCount }, () => ({ swara: '', sahitya: '' })),
  }
}

function ensureCells(rows: CompositionRow[], cellCount: number): CompositionRow[] {
  return rows.map((row) => {
    if (row.type !== 'notation') return row
    if (row.cells.length >= cellCount) return row
    const extra = Array.from({ length: cellCount - row.cells.length }, () => ({ swara: '', sahitya: '' }))
    return { ...row, cells: [...row.cells, ...extra] }
  })
}

function getCellCountFromMeta(meta: CompositionMeta): number {
  return getCellCount(
    meta.talaBase as Parameters<typeof getCellCount>[0],
    meta.jathi as Parameters<typeof getCellCount>[1],
    meta.kalai,
    meta.maatras
  )
}

function initialState(): CompositionState {
  const meta = { ...DEFAULT_META }
  const cellCount = getCellCountFromMeta(meta)
  return { meta, rows: [makeEmptyRow(cellCount)], cloudId: null }
}

function reducer(state: CompositionState, action: Action): CompositionState {
  switch (action.type) {
    case 'UPDATE_META': {
      const newMeta = { ...state.meta, ...action.payload }
      const cellCount = getCellCountFromMeta(newMeta)
      return { ...state, meta: newMeta, rows: ensureCells(state.rows, cellCount) }
    }

    case 'UPDATE_CELL': {
      const rows = state.rows.map((row, i) => {
        if (i !== action.rowIndex || row.type !== 'notation') return row
        const cells = row.cells.map((cell, j) =>
          j === action.cellIndex ? { ...cell, [action.field]: action.value } : cell
        )
        return { ...row, cells }
      })
      return { ...state, rows }
    }

    case 'ADD_ROW': {
      const cellCount = getCellCountFromMeta(state.meta)
      return { ...state, rows: [...state.rows, makeEmptyRow(cellCount)] }
    }

    case 'INSERT_ROW_AFTER': {
      const cellCount = getCellCountFromMeta(state.meta)
      const rows = [...state.rows]
      rows.splice(action.rowIndex + 1, 0, makeEmptyRow(cellCount))
      return { ...state, rows }
    }

    case 'ADD_HEADING': {
      return { ...state, rows: [...state.rows, { type: 'heading', label: '' }] }
    }

    case 'INSERT_HEADING_BEFORE': {
      const rows = [...state.rows]
      rows.splice(action.rowIndex, 0, { type: 'heading', label: '' })
      return { ...state, rows }
    }

    case 'DELETE_ROW': {
      if (state.rows.length <= 1) return state // never delete last row
      return { ...state, rows: state.rows.filter((_, i) => i !== action.rowIndex) }
    }

    case 'UPDATE_HEADING': {
      const rows = state.rows.map((row, i) =>
        i === action.rowIndex && row.type === 'heading' ? { ...row, label: action.label } : row
      )
      return { ...state, rows }
    }

    case 'MOVE_ROW': {
      const rows = [...state.rows]
      const target = action.direction === 'up' ? action.rowIndex - 1 : action.rowIndex + 1
      if (target < 0 || target >= rows.length) return state
      ;[rows[action.rowIndex], rows[target]] = [rows[target], rows[action.rowIndex]]
      return { ...state, rows }
    }

    case 'SET_SANGATHI': {
      const rows = state.rows.map((row, i) => {
        if (i !== action.rowIndex || row.type !== 'notation') return row
        return { ...row, sangathiNumber: action.sangathiNumber }
      })
      return { ...state, rows }
    }

    case 'DUPLICATE_AS_SANGATHI': {
      const src = state.rows[action.rowIndex]
      if (!src || src.type !== 'notation') return state
      const baseNum = src.sangathiNumber ?? 1
      const copy: CompositionRow = {
        type: 'notation',
        cells: src.cells.map((c) => ({ ...c })),
        sangathiNumber: baseNum + 1,
      }
      // If the source wasn't yet marked as a sangathi, label it the first variation.
      const rows = state.rows.map((row, i) =>
        i === action.rowIndex && row.type === 'notation' && row.sangathiNumber === undefined
          ? { ...row, sangathiNumber: 1 }
          : row
      )
      rows.splice(action.rowIndex + 1, 0, copy)
      return { ...state, rows }
    }

    case 'FILL_ROW_GAPS': {
      const rows = state.rows.map((row, i) => {
        if (i !== action.rowIndex || row.type !== 'notation') return row
        const cells = row.cells.map((cell) => {
          if ((cell[action.field] || '').trim() !== '') return cell
          return { ...cell, [action.field]: action.value }
        })
        return { ...row, cells }
      })
      return { ...state, rows }
    }

    case 'LOAD_COMPOSITION': {
      const cellCount = getCellCountFromMeta(action.state.meta)
      return { ...action.state, rows: ensureCells(action.state.rows, cellCount) }
    }

    case 'SET_CLOUD_ID':
      return { ...state, cloudId: action.cloudId }

    case 'SET_PUBLIC':
      return { ...state, isPublic: action.isPublic, shareId: action.shareId }

    case 'NEW_COMPOSITION': {
      const meta = { ...DEFAULT_META }
      const cellCount = getCellCountFromMeta(meta)
      return { meta, rows: [makeEmptyRow(cellCount)], cloudId: null }
    }

    default:
      return state
  }
}

/* ──────────────────────────────────────────────
   Undo / redo history wrapper
────────────────────────────────────────────── */

const MAX_HISTORY = 100

type HistoryState = {
  past: CompositionState[]
  present: CompositionState
  future: CompositionState[]
  lastTag: string | null
}

// Actions that update the present without creating an undo checkpoint.
const NON_CHECKPOINT = new Set<Action['type']>(['SET_CLOUD_ID', 'SET_PUBLIC'])
// Actions that replace the document entirely and clear history.
const RESET_HISTORY = new Set<Action['type']>(['LOAD_COMPOSITION', 'NEW_COMPOSITION'])

// Continuous edits (typing in a cell/heading/field) coalesce into a single
// undo step while the target stays the same.
function coalesceTag(action: Action): string | null {
  switch (action.type) {
    case 'UPDATE_CELL':
      return `cell:${action.rowIndex}:${action.cellIndex}:${action.field}`
    case 'UPDATE_HEADING':
      return `heading:${action.rowIndex}`
    case 'UPDATE_META':
      return `meta:${Object.keys(action.payload).join(',')}`
    default:
      return null
  }
}

function historyReducer(h: HistoryState, action: Action): HistoryState {
  if (action.type === 'UNDO') {
    if (h.past.length === 0) return h
    const previous = h.past[h.past.length - 1]
    return {
      past: h.past.slice(0, -1),
      present: previous,
      future: [h.present, ...h.future],
      lastTag: null,
    }
  }

  if (action.type === 'REDO') {
    if (h.future.length === 0) return h
    const next = h.future[0]
    return {
      past: [...h.past, h.present],
      present: next,
      future: h.future.slice(1),
      lastTag: null,
    }
  }

  const present = reducer(h.present, action)
  if (present === h.present) return h // no-op, don't touch history

  if (RESET_HISTORY.has(action.type)) {
    return { past: [], present, future: [], lastTag: null }
  }

  if (NON_CHECKPOINT.has(action.type)) {
    return { ...h, present }
  }

  const tag = coalesceTag(action)
  if (tag !== null && tag === h.lastTag) {
    // Continuation of the same edit — replace present, keep the prior checkpoint.
    return { ...h, present, future: [] }
  }

  return {
    past: [...h.past, h.present].slice(-MAX_HISTORY),
    present,
    future: [],
    lastTag: tag,
  }
}

type CompositionContextValue = {
  state: CompositionState
  dispatch: React.Dispatch<Action>
  saveIndicator: string
  setSaveIndicator: (msg: string) => void
  canUndo: boolean
  canRedo: boolean
}

const CompositionContext = createContext<CompositionContextValue | null>(null)

export function CompositionProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: CompositionState
}) {
  const [history, dispatch] = useReducer(historyReducer, undefined, () => ({
    past: [],
    present: initialData ?? initialState(),
    future: [],
    lastTag: null,
  }))
  const state = history.present
  const [saveIndicator, setSaveIndicator] = React.useState('Not yet saved')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current || initialData) return
    isInitialized.current = true
    const saved = loadAutosave()
    if (saved) {
      dispatch({ type: 'LOAD_COMPOSITION', state: saved })
      setSaveIndicator('Restored from autosave')
    }
  }, [initialData])

  useEffect(() => {
    if (!isInitialized.current && !initialData) return
    isInitialized.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      autosave(state)
      setSaveIndicator(`Autosaved ${new Date().toLocaleTimeString()}`)
    }, 600)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [state, initialData])

  return (
    <CompositionContext.Provider
      value={{
        state,
        dispatch,
        saveIndicator,
        setSaveIndicator,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
      }}
    >
      {children}
    </CompositionContext.Provider>
  )
}

export function useComposition() {
  const ctx = useContext(CompositionContext)
  if (!ctx) throw new Error('useComposition must be inside CompositionProvider')
  return ctx
}
