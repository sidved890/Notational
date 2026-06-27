'use client'

import { useRef, useEffect, RefObject } from 'react'
import { useComposition } from '@/context/CompositionContext'

// Character substitutions for swara input
const DOT_BELOW: Record<string, string> = {
  m: 'ṃ', // ṃ
  p: 'p̣', // p̣
  d: 'ḍ', // ḍ
  n: 'ṇ', // ṇ
  s: 'ṣ', // ṣ
}

const DOT_ABOVE: Record<string, string> = {
  s: 'ṡ', // ṡ
  r: 'ṙ', // ṙ
  g: 'ġ', // ġ
  m: 'ṁ', // ṁ
  p: 'ṗ', // ṗ
}

function applySubstitutions(val: string, cursorPos: number): { val: string; cursor: number } | null {
  // Comma → ↄ
  if (val.includes(',')) {
    const newVal = val.replaceAll(',', 'ɔ')
    return { val: newVal, cursor: cursorPos }
  }
  // Dot-below: char + ;
  if (cursorPos >= 2) {
    const prev = val[cursorPos - 2].toLowerCase()
    const suffix = val[cursorPos - 1]
    if (suffix === ';' && DOT_BELOW[prev]) {
      const rep = DOT_BELOW[prev]
      const newVal = val.slice(0, cursorPos - 2) + rep + val.slice(cursorPos)
      const nc = cursorPos - 2 + rep.length
      return { val: newVal, cursor: nc }
    }
    if (suffix === "'" && DOT_ABOVE[prev]) {
      const rep = DOT_ABOVE[prev]
      const newVal = val.slice(0, cursorPos - 2) + rep + val.slice(cursorPos)
      const nc = cursorPos - 2 + rep.length
      return { val: newVal, cursor: nc }
    }
  }
  return null
}

export type CellRef = {
  swaraRef: RefObject<HTMLInputElement | null>
  sahityaRef: RefObject<HTMLInputElement | null>
}

type Props = {
  rowIndex: number
  cellIndex: number
  swara: string
  sahitya: string
  sangati?: boolean
  isPlaybackHl?: boolean
  onNavigate: (
    rowIndex: number,
    cellIndex: number,
    direction: 'left' | 'right' | 'up' | 'down' | 'swara' | 'sahitya' | 'prevSwara',
  ) => void
}

export default function NotationCell({
  rowIndex,
  cellIndex,
  swara,
  sahitya,
  sangati,
  isPlaybackHl,
  onNavigate,
}: Props) {
  const { dispatch } = useComposition()
  const swaraRef = useRef<HTMLInputElement>(null)
  const sahityaRef = useRef<HTMLInputElement>(null)

  // Auto-shrink sahitya font
  useEffect(() => {
    const el = sahityaRef.current
    if (!el) return
    el.style.fontSize = ''
    let fs = 10
    while (el.scrollWidth > el.clientWidth + 1 && fs > 6.5) {
      fs -= 0.5
      el.style.fontSize = `${fs}px`
    }
  }, [sahitya])

  function handleSwaraChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value
    const cursor = e.target.selectionStart ?? val.length

    // Apply comma substitution immediately on input
    if (val.includes(',')) {
      val = val.replaceAll(',', 'ɔ')
      e.target.value = val
    }

    dispatch({ type: 'UPDATE_CELL', rowIndex, cellIndex, field: 'swara', value: val })
  }

  function handleSwaraKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== ';' && e.key !== "'") return
    const input = e.currentTarget
    const val = input.value
    const cur = input.selectionStart ?? val.length
    const result = applySubstitutions(val, cur)
    if (result) {
      input.value = result.val
      input.setSelectionRange(result.cursor, result.cursor)
      dispatch({ type: 'UPDATE_CELL', rowIndex, cellIndex, field: 'swara', value: result.val })
    }
  }

  function handleSwaraKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const input = e.currentTarget
    switch (e.key) {
      case 'Backspace':
      case 'Delete':
        // Clear the current swara cell, then move focus to the cell on the left.
        e.preventDefault()
        if (input.value !== '') {
          dispatch({ type: 'UPDATE_CELL', rowIndex, cellIndex, field: 'swara', value: '' })
        }
        onNavigate(rowIndex, cellIndex, 'left')
        break
      case 'Enter':
        e.preventDefault()
        onNavigate(rowIndex, cellIndex, 'sahitya')
        break
      case 'ArrowRight':
        if (input.selectionStart === input.value.length) {
          e.preventDefault()
          onNavigate(rowIndex, cellIndex, 'right')
        }
        break
      case 'ArrowLeft':
        if (input.selectionStart === 0) {
          e.preventDefault()
          onNavigate(rowIndex, cellIndex, 'left')
        }
        break
      case 'ArrowDown':
        e.preventDefault()
        onNavigate(rowIndex, cellIndex, 'sahitya') // ↓ from swara → sahitya (same cell)
        break
      case 'ArrowUp':
        e.preventDefault()
        onNavigate(rowIndex, cellIndex, 'up') // ↑ from swara → previous avartanam
        break
      case 'Tab':
        e.preventDefault()
        if (e.shiftKey) {
          onNavigate(rowIndex, cellIndex, 'prevSwara')
        } else {
          onNavigate(rowIndex, cellIndex, 'sahitya')
        }
        break
    }
  }

  function handleSahityaChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch({ type: 'UPDATE_CELL', rowIndex, cellIndex, field: 'sahitya', value: e.target.value })
  }

  function handleSahityaKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        onNavigate(rowIndex, cellIndex, 'right')
        break
      case 'Tab':
        e.preventDefault()
        if (e.shiftKey) {
          onNavigate(rowIndex, cellIndex, 'swara')
        } else {
          onNavigate(rowIndex, cellIndex, 'right')
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        onNavigate(rowIndex, cellIndex, 'swara') // ↑ from sahitya → swara (same cell)
        break
      case 'ArrowDown':
        e.preventDefault()
        onNavigate(rowIndex, cellIndex, 'down') // ↓ from sahitya → next avartanam, same column
        break
    }
  }

  return (
    <div
      className={`notation-cell${sangati ? ' sangati' : ''}${isPlaybackHl ? ' playback-hl' : ''}`}
      data-row-index={rowIndex}
      data-cell={cellIndex}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--cell-border)',
        position: 'relative',
        ...(sangati ? { background: 'rgba(107,30,46,0.05)' } : {}),
      }}
    >
      <input
        ref={swaraRef}
        className="cell-swara"
        type="text"
        value={swara}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-row-index={rowIndex}
        data-cell={cellIndex}
        data-type="swara"
        onChange={handleSwaraChange}
        onKeyUp={handleSwaraKeyUp}
        onKeyDown={handleSwaraKeyDown}
        style={sangati ? { color: 'var(--burgundy)', fontStyle: 'italic' } : {}}
      />
      <input
        ref={sahityaRef}
        className="cell-sahitya"
        type="text"
        value={sahitya}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-row-index={rowIndex}
        data-cell={cellIndex}
        data-type="sahitya"
        onChange={handleSahityaChange}
        onKeyDown={handleSahityaKeyDown}
      />
    </div>
  )
}
