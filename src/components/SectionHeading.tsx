'use client'

import { useRef, useState } from 'react'
import { useComposition } from '@/context/CompositionContext'

const SECTION_PRESETS = ['Pallavi', 'Anupallavi', 'Charanam', 'Chittaswaram', 'Madhyamakala Sahityam', 'Swarajati', 'Varnam']

type Props = {
  rowIndex: number
  label: string
  readOnly?: boolean
  onMove?: (rowIndex: number, direction: 'up' | 'down') => void
  animClass?: string
}

export default function SectionHeading({ rowIndex, label, readOnly, onMove, animClass }: Props) {
  const { state, dispatch } = useComposition()
  const selectRef = useRef<HTMLSelectElement>(null)
  const [exiting, setExiting] = useState(false)

  function requestDelete() {
    setExiting(true)
    setTimeout(() => dispatch({ type: 'DELETE_ROW', rowIndex }), 180)
  }

  if (readOnly) {
    return (
      <div className="section-heading-row" data-row-index={rowIndex} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
        background: 'linear-gradient(to right, rgba(107,30,46,0.07), rgba(201,151,58,0.04), transparent)',
        borderTop: '1.5px solid rgba(201,151,58,0.4)', borderBottom: '1px solid rgba(201,151,58,0.2)',
      }}>
        <span style={{ color: 'var(--gold)', fontSize: 12, flexShrink: 0, opacity: 0.8 }}>◆</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontStyle: 'italic', color: 'var(--burgundy)', fontWeight: 600 }}>{label}</span>
      </div>
    )
  }

  return (
    <div className={`section-heading-row${animClass ? ` ${animClass}` : ''}`} data-row-index={rowIndex} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
      background: 'linear-gradient(to right, rgba(107,30,46,0.07), rgba(201,151,58,0.04), transparent)',
      borderTop: '1.5px solid rgba(201,151,58,0.4)', borderBottom: '1px solid rgba(201,151,58,0.2)',
      ...(exiting ? { opacity: 0, transform: 'translateY(-6px)', transition: 'opacity 0.18s ease, transform 0.18s ease' } : {}),
    }}>
      <span style={{ color: 'var(--gold)', fontSize: 12, flexShrink: 0, opacity: 0.8 }}>◆</span>

      <input
        className="heading-label-input"
        type="text"
        value={label}
        placeholder="Section name…"
        spellCheck={false}
        onChange={(e) => dispatch({ type: 'UPDATE_HEADING', rowIndex, label: e.target.value })}
        style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontStyle: 'italic', color: 'var(--burgundy)', fontWeight: 600, border: 'none', background: 'transparent', outline: 'none', minWidth: 140 }}
      />

      <select ref={selectRef} defaultValue="" onChange={(e) => { if (e.target.value) { dispatch({ type: 'UPDATE_HEADING', rowIndex, label: e.target.value }); e.target.value = '' } }} style={{ fontFamily: 'var(--font-ui)', fontSize: 11, padding: '3px 8px', border: '1.5px solid rgba(107,30,46,0.2)', borderRadius: 4, background: 'var(--parchment)', color: 'var(--ink-light)', cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none', outline: 'none' }}>
        <option value="">— Quick select —</option>
        {SECTION_PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Move buttons */}
      <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
        <button onClick={() => (onMove ? onMove(rowIndex, 'up') : dispatch({ type: 'MOVE_ROW', rowIndex, direction: 'up' }))} disabled={rowIndex === 0} title="Move up" style={{ background: 'none', border: '1px solid rgba(107,30,46,0.2)', borderRadius: 3, color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 11, padding: '2px 5px', lineHeight: 1 }}>▲</button>
        <button onClick={() => (onMove ? onMove(rowIndex, 'down') : dispatch({ type: 'MOVE_ROW', rowIndex, direction: 'down' }))} disabled={rowIndex === state.rows.length - 1} title="Move down" style={{ background: 'none', border: '1px solid rgba(107,30,46,0.2)', borderRadius: 3, color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 11, padding: '2px 5px', lineHeight: 1 }}>▼</button>
      </div>

      <button onClick={requestDelete} title="Remove heading" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 18, padding: '0 6px', borderRadius: 3, lineHeight: 1, transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--burgundy)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}>×</button>
    </div>
  )
}
