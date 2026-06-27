'use client'

import { useRef } from 'react'
import { useComposition } from '@/context/CompositionContext'
import { serializeState, deserializeState } from '@/lib/storage'

type Props = {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  darkMode: boolean
  onDarkToggle: () => void
  onHelpToggle: () => void
  onSaveCloud?: () => void
  onShare?: () => void
  isLoggedIn: boolean
}

export default function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  darkMode,
  onDarkToggle,
  onHelpToggle,
  onSaveCloud,
  onShare,
  isLoggedIn,
}: Props) {
  const { state, dispatch, saveIndicator } = useComposition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleSaveJSON() {
    const data = serializeState(state)
    const name = state.meta.name.trim() || 'composition'
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleLoadClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        const loaded = deserializeState(data)
        dispatch({ type: 'LOAD_COMPOSITION', state: loaded })
      } catch {
        alert('Invalid Notational JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const indicatorIsGreen =
    saveIndicator.startsWith('Autosaved') ||
    saveIndicator.startsWith('Saved') ||
    saveIndicator === 'Loaded'

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        marginBottom: 14,
        flexWrap: 'wrap',
      }}
      className="no-print"
    >
      <button className="btn btn-primary" onClick={handleSaveJSON}>
        ⬇ Save JSON
      </button>
      <button className="btn btn-secondary" onClick={handleLoadClick}>
        ⬆ Load JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button className="btn btn-gold" onClick={() => window.print()}>
        ⎙ Print
      </button>

      {onSaveCloud && (
        <button className="btn btn-secondary" onClick={onSaveCloud}>
          ☁ Save to Cloud
        </button>
      )}
      {isLoggedIn && onShare && (
        <button className="btn btn-gold" onClick={onShare} title="Generate a public share link">
          ↗ Share
        </button>
      )}

      {/* Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
        <label
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--burgundy)',
            opacity: 0.7,
          }}
        >
          Zoom
        </label>
        <ZoomBtn onClick={onZoomOut}>−</ZoomBtn>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--gold)',
            minWidth: 36,
            textAlign: 'center',
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <ZoomBtn onClick={onZoomIn}>+</ZoomBtn>
        <ZoomBtn onClick={onZoomReset} title="Reset zoom" style={{ fontSize: 10, width: 'auto', padding: '0 6px' }}>
          ↺
        </ZoomBtn>
      </div>

      {/* Dark mode */}
      <button className="btn btn-icon btn-secondary" onClick={onDarkToggle} title="Toggle dark mode">
        {darkMode ? '☀' : '☽'}
      </button>

      {/* Help */}
      <button
        className="btn btn-icon btn-secondary"
        onClick={onHelpToggle}
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>

      {/* Save indicator */}
      <span
        style={{
          fontSize: 12,
          fontStyle: 'italic',
          marginLeft: 'auto',
          color: indicatorIsGreen ? '#5A8A3A' : 'var(--ink-faint)',
          transition: 'color 0.3s',
        }}
      >
        {saveIndicator}
      </span>
    </div>
  )
}

function ZoomBtn({
  children,
  onClick,
  title,
  style: extraStyle,
}: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  style?: React.CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: '1.5px solid rgba(107,30,46,0.3)',
        borderRadius: 3,
        color: 'var(--burgundy)',
        fontSize: 15,
        width: 26,
        height: 26,
        cursor: 'pointer',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        padding: 0,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--gold-faint)'
        el.style.borderColor = 'var(--gold)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'transparent'
        el.style.borderColor = 'rgba(107,30,46,0.3)'
      }}
    >
      {children}
    </button>
  )
}
