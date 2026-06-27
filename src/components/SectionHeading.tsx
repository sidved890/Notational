'use client'

import { useRef } from 'react'
import { useComposition } from '@/context/CompositionContext'
import { SECTION_PRESETS } from '@/lib/tala'

type Props = {
  rowIndex: number
  label: string
}

export default function SectionHeading({ rowIndex, label }: Props) {
  const { dispatch } = useComposition()
  const selectRef = useRef<HTMLSelectElement>(null)

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch({ type: 'UPDATE_HEADING', rowIndex, label: e.target.value })
  }

  function handlePresetChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (!val) return
    dispatch({ type: 'UPDATE_HEADING', rowIndex, label: val })
    e.target.value = ''
  }

  function handleDelete() {
    dispatch({ type: 'DELETE_ROW', rowIndex })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 16px',
        background:
          'linear-gradient(to right, rgba(107,30,46,0.07), rgba(201,151,58,0.04), transparent)',
        borderTop: '1.5px solid rgba(201,151,58,0.4)',
        borderBottom: '1px solid rgba(201,151,58,0.2)',
      }}
    >
      {/* Diamond bullet */}
      <span
        style={{
          color: 'var(--gold)',
          fontSize: 12,
          flexShrink: 0,
          opacity: 0.8,
        }}
      >
        ◆
      </span>

      {/* Label input */}
      <input
        className="heading-label-input"
        type="text"
        value={label}
        placeholder="Section name…"
        spellCheck={false}
        onChange={handleLabelChange}
      />

      {/* Preset dropdown */}
      <select
        ref={selectRef}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          padding: '3px 8px',
          border: '1.5px solid rgba(107,30,46,0.2)',
          borderRadius: 4,
          background: 'var(--parchment)',
          color: 'var(--ink-light)',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          appearance: 'none',
          outline: 'none',
        }}
        onChange={handlePresetChange}
        defaultValue=""
      >
        <option value="">— Quick select —</option>
        {SECTION_PRESETS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        title="Remove section heading"
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'var(--ink-faint)',
          cursor: 'pointer',
          fontSize: 18,
          padding: '0 6px',
          borderRadius: 3,
          lineHeight: 1,
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--burgundy)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-faint)'
        }}
      >
        ×
      </button>
    </div>
  )
}
