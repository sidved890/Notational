'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { CompositionState, CompositionMeta, CompositionRow, NotationCell } from '@/lib/types'
import { getCellCount } from '@/lib/tala'
import { autosave, loadAutosave } from '@/lib/storage'

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'UPDATE_META'; payload: Partial<CompositionMeta> }
  | { type: 'UPDATE_CELL'; rowIndex: number; cellIndex: number; field: 'swara' | 'sahitya'; value: string }
  | { type: 'ADD_ROW' }
  | { type: 'ADD_HEADING' }
  | { type: 'INSERT_HEADING_BEFORE'; rowIndex: number }
  | { type: 'DELETE_ROW'; rowIndex: number }
  | { type: 'UPDATE_HEADING'; rowIndex: number; label: string }
  | { type: 'LOAD_COMPOSITION'; state: CompositionState }
  | { type: 'SET_CLOUD_ID'; cloudId: string }
  | { type: 'NEW_COMPOSITION' }

// ── Default State ─────────────────────────────────────────────────────────────

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
    const extra = Array.from({ length: cellCount - row.cells.length }, () => ({
      swara: '',
      sahitya: '',
    }))
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
  return {
    meta,
    rows: Array.from({ length: 4 }, () => makeEmptyRow(cellCount)),
    cloudId: null,
  }
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: CompositionState, action: Action): CompositionState {
  switch (action.type) {
    case 'UPDATE_META': {
      const newMeta = { ...state.meta, ...action.payload }
      const cellCount = getCellCountFromMeta(newMeta)
      const rows = ensureCells(state.rows, cellCount)
      return { ...state, meta: newMeta, rows }
    }

    case 'UPDATE_CELL': {
      const rows = state.rows.map((row, i) => {
        if (i !== action.rowIndex || row.type !== 'notation') return row
        const cells = row.cells.map((cell, j): NotationCell => {
          if (j !== action.cellIndex) return cell
          return { ...cell, [action.field]: action.value }
        })
        return { ...row, cells }
      })
      return { ...state, rows }
    }

    case 'ADD_ROW': {
      const cellCount = getCellCountFromMeta(state.meta)
      return {
        ...state,
        rows: [...state.rows, makeEmptyRow(cellCount)],
      }
    }

    case 'ADD_HEADING': {
      return {
        ...state,
        rows: [...state.rows, { type: 'heading', label: '' }],
      }
    }

    case 'INSERT_HEADING_BEFORE': {
      const rows = [...state.rows]
      rows.splice(action.rowIndex, 0, { type: 'heading', label: '' })
      return { ...state, rows }
    }

    case 'DELETE_ROW': {
      return {
        ...state,
        rows: state.rows.filter((_, i) => i !== action.rowIndex),
      }
    }

    case 'UPDATE_HEADING': {
      const rows = state.rows.map((row, i) => {
        if (i !== action.rowIndex || row.type !== 'heading') return row
        return { ...row, label: action.label }
      })
      return { ...state, rows }
    }

    case 'LOAD_COMPOSITION': {
      const cellCount = getCellCountFromMeta(action.state.meta)
      const rows = ensureCells(action.state.rows, cellCount)
      return { ...action.state, rows }
    }

    case 'SET_CLOUD_ID': {
      return { ...state, cloudId: action.cloudId }
    }

    case 'NEW_COMPOSITION': {
      const meta = { ...DEFAULT_META }
      const cellCount = getCellCountFromMeta(meta)
      return {
        meta,
        rows: Array.from({ length: 4 }, () => makeEmptyRow(cellCount)),
        cloudId: null,
      }
    }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

type CompositionContextValue = {
  state: CompositionState
  dispatch: React.Dispatch<Action>
  saveIndicator: string
  setSaveIndicator: (msg: string) => void
}

const CompositionContext = createContext<CompositionContextValue | null>(null)

export function CompositionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [saveIndicator, setSaveIndicator] = React.useState('Not yet saved')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isInitialized = useRef(false)

  // Load from autosave on mount
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    const saved = loadAutosave()
    if (saved) {
      dispatch({ type: 'LOAD_COMPOSITION', state: saved })
      setSaveIndicator('Restored from autosave')
    }
  }, [])

  // Autosave whenever state changes
  useEffect(() => {
    if (!isInitialized.current) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      autosave(state)
      const time = new Date().toLocaleTimeString()
      setSaveIndicator(`Autosaved ${time}`)
    }, 600)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [state])

  return (
    <CompositionContext.Provider value={{ state, dispatch, saveIndicator, setSaveIndicator }}>
      {children}
    </CompositionContext.Provider>
  )
}

export function useComposition() {
  const ctx = useContext(CompositionContext)
  if (!ctx) throw new Error('useComposition must be used inside CompositionProvider')
  return ctx
}
