'use client'

import { useComposition } from '@/context/CompositionContext'
import TalaPicker from './TalaPicker'

export default function MetadataPanel() {
  const { state, dispatch } = useComposition()
  const { meta } = state

  function update(field: string, value: string | number) {
    dispatch({ type: 'UPDATE_META', payload: { [field]: value } })
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--parchment-dark) 0%, var(--parchment) 100%)',
        border: '1.5px solid rgba(201,151,58,0.4)',
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 20,
        boxShadow: '0 2px 12px var(--shadow)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          color: 'var(--burgundy)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 16,
          fontStyle: 'italic',
        }}
      >
        Composition Details
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px 24px',
        }}
        className="metadata-grid"
      >
        {/* Song Name */}
        <FieldGroup label="Song Name">
          <input
            className="field-input"
            type="text"
            value={meta.name}
            placeholder="e.g. Vataapi Ganapatim Bhaje"
            onChange={(e) => update('name', e.target.value)}
          />
        </FieldGroup>

        {/* Ragam */}
        <FieldGroup label="Ragam">
          <input
            className="field-input"
            type="text"
            value={meta.ragam}
            placeholder="e.g. Hamsadhwani"
            onChange={(e) => update('ragam', e.target.value)}
          />
        </FieldGroup>

        {/* Composer */}
        <FieldGroup label="Composer">
          <input
            className="field-input"
            type="text"
            value={meta.composer}
            placeholder="e.g. Muthuswami Dikshitar"
            onChange={(e) => update('composer', e.target.value)}
          />
        </FieldGroup>

        {/* Talam — spans all 3 columns */}
        <div style={{ gridColumn: '1 / -1' }}>
          <TalaPicker />
        </div>

        {/* Kalai */}
        <FieldGroup label="Kalai (Speed)">
          <div
            style={{
              display: 'flex',
              border: '1.5px solid rgba(107,30,46,0.25)',
              borderRadius: 4,
              overflow: 'hidden',
              background: 'var(--parchment)',
            }}
          >
            {([1, 2] as const).map((k) => (
              <button
                key={k}
                onClick={() => update('kalai', k)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '7px 10px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: 'none',
                  borderRight: k === 1 ? '1.5px solid rgba(107,30,46,0.2)' : 'none',
                  background: meta.kalai === k ? 'var(--burgundy)' : 'transparent',
                  color: meta.kalai === k ? 'var(--parchment)' : 'var(--ink-light)',
                }}
              >
                {k}× {k === 1 ? 'Normal' : 'Double'}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Maatras per beat */}
        <FieldGroup label="Maatras per Beat">
          <input
            className="field-input"
            type="number"
            min={1}
            max={8}
            value={meta.maatras}
            onChange={(e) => {
              const v = parseInt(e.target.value)
              if (v >= 1 && v <= 8) update('maatras', v)
            }}
          />
        </FieldGroup>
      </div>

      <style>{`
        @media (max-width: 900px) { .metadata-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .metadata-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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
        {label}
      </label>
      {children}
    </div>
  )
}
