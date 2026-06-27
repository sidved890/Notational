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
  | { type: 'LOAD_COMPOSITION'; state: CompositionState }
  | { type: 'SET_CLOUD_ID'; cloudId: string }
  | { type: 'SET_PUBLIC'; isPublic: boolean; shareId?: string }
  | { type: 'NEW_COMPOSITION' }

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

type CompositionContextValue = {
  state: CompositionState
  dispatch: React.Dispatch<Action>
  saveIndicator: string
  setSaveIndicator: (msg: string) => void
}

const CompositionContext = createContext<CompositionContextValue | null>(null)

export function CompositionProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: CompositionState
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialData ?? initialState()
  )
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
    <CompositionContext.Provider value={{ state, dispatch, saveIndicator, setSaveIndicator }}>
      {children}
    </CompositionContext.Provider>
  )
}

export function useComposition() {
  const ctx = useContext(CompositionContext)
  if (!ctx) throw new Error('useComposition must be inside CompositionProvider')
  return ctx
}
