'use client'

import { useState } from 'react'
import { THEMES, ThemeId } from '@/lib/themes'

type Props = {
  theme: ThemeId
  onThemeChange: (theme: ThemeId) => void
  compact?: boolean
}

export default function ThemePicker({ theme, onThemeChange, compact }: Props) {
  const [open, setOpen] = useState(false)
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-icon btn-secondary"
        onClick={() => setOpen((v) => !v)}
        title="Choose theme"
        aria-label="Choose theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 0 : 6,
          padding: compact ? '7px 10px' : '7px 12px',
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: current.swatch,
            border: `2px solid ${current.accent}`,
            flexShrink: 0,
          }}
        />
        {!compact && (
          <span style={{ fontSize: 12, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
            {current.label}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 100,
              marginTop: 6,
              background: 'var(--parchment)',
              border: '1.5px solid var(--gold)',
              borderRadius: 8,
              padding: 10,
              boxShadow: '0 4px 16px var(--shadow)',
              minWidth: 168,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: 8,
              }}
            >
              Theme
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {THEMES.map((t) => {
                const active = t.id === theme
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onThemeChange(t.id)
                      setOpen(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: active ? '1.5px solid var(--gold)' : '1.5px solid transparent',
                      background: active ? 'var(--gold-faint)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: t.swatch,
                        border: `2px solid ${t.accent}`,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: 'var(--font-ui)',
                        fontWeight: active ? 700 : 500,
                        color: active ? 'var(--burgundy)' : 'var(--ink-light)',
                      }}
                    >
                      {t.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
