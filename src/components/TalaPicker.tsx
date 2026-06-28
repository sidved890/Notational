'use client'

import { useComposition } from '@/context/CompositionContext'
import {
  BASE_TALAS,
  JATHIS,
  TALA_BASE_LABELS,
  JATHI_LABELS,
  IS_SPECIAL_TALA,
  TALA_PRESETS,
  getBeatCount,
  TalaBase,
  Jathi,
} from '@/lib/tala'

export default function TalaPicker() {
  const { state, dispatch } = useComposition()
  const { talaBase, jathi, kalai } = state.meta

  function setTalaBase(base: TalaBase) {
    dispatch({ type: 'UPDATE_META', payload: { talaBase: base } })
  }

  function setJathi(j: Jathi) {
    dispatch({ type: 'UPDATE_META', payload: { jathi: j } })
  }

  function applyPreset(preset: (typeof TALA_PRESETS)[0]) {
    dispatch({
      type: 'UPDATE_META',
      payload: { talaBase: preset.talaBase, jathi: preset.jathi },
    })
  }

  const isSpecial = IS_SPECIAL_TALA[talaBase as TalaBase]
  const beats = getBeatCount(talaBase as TalaBase, jathi as Jathi, kalai)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--burgundy)',
          opacity: 0.8,
        }}
      >
        Talam
      </label>

      {/* Presets row */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            whiteSpace: 'nowrap',
          }}
        >
          Presets:
        </span>
        {TALA_PRESETS.slice(0, 5).map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            style={{
              padding: '3px 10px',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1.5px solid',
              transition: 'all 0.15s',
              background:
                talaBase === preset.talaBase && jathi === preset.jathi
                  ? 'var(--burgundy)'
                  : 'transparent',
              borderColor:
                talaBase === preset.talaBase && jathi === preset.jathi
                  ? 'var(--burgundy)'
                  : 'rgba(107,30,46,0.3)',
              color:
                talaBase === preset.talaBase && jathi === preset.jathi
                  ? 'var(--parchment)'
                  : 'var(--burgundy)',
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Base Tala row */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            marginBottom: 4,
          }}
        >
          Base Tala
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {BASE_TALAS.map((base) => (
            <ToggleBtn
              key={base}
              active={talaBase === base}
              onClick={() => setTalaBase(base)}
              label={TALA_BASE_LABELS[base]}
            />
          ))}
        </div>
      </div>

      {/* Jathi row — hidden for special talas */}
      {!isSpecial && (
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
              marginBottom: 4,
            }}
          >
            Jathi
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {JATHIS.map((j) => (
              <ToggleBtn
                key={j}
                active={jathi === j}
                onClick={() => setJathi(j)}
                label={JATHI_LABELS[j]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Beat count display */}
      <div
        style={{
          fontSize: 12,
          color: 'var(--gold)',
          fontWeight: 600,
          fontFamily: 'var(--font-serif)',
        }}
      >
        {beats} beats per avarthanam ({kalai} Kalai)
      </div>
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: 4,
        fontSize: 12,
        fontFamily: 'var(--font-ui)',
        fontWeight: 600,
        cursor: 'pointer',
        border: '1.5px solid',
        transition: 'all 0.15s',
        background: active ? 'var(--burgundy)' : 'transparent',
        borderColor: active ? 'var(--burgundy)' : 'rgba(107,30,46,0.3)',
        color: active ? 'var(--parchment)' : 'var(--burgundy)',
      }}
    >
      {label}
    </button>
  )
}
