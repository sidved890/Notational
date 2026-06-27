'use client'

import { useState } from 'react'
import { useComposition } from '@/context/CompositionContext'
import TalaPicker from './TalaPicker'

export default function MetadataPanel() {
  const { state, dispatch } = useComposition()
  const { meta } = state
  const [showRagaInfo, setShowRagaInfo] = useState(!!(meta.melakarta || meta.arohanam || meta.avarohanam))

  function update(field: string, value: string | number | boolean) {
    dispatch({ type: 'UPDATE_META', payload: { [field]: value } })
  }

  return (
    <div className="metadata-panel no-print" style={{
      background: 'linear-gradient(135deg, var(--parchment-dark) 0%, var(--parchment) 100%)',
      border: '1.5px solid rgba(201,151,58,0.4)', borderRadius: 8,
      padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 12px var(--shadow)',
    }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--burgundy)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontStyle: 'italic' }}>
        Composition Details
      </h2>

      {/* Print header — only visible on print */}
      <div className="print-header" style={{ display: 'none' }}>
        <div className="print-title">{meta.name || 'Untitled'}</div>
        <div className="print-subtitle">
          {[meta.ragam, getTalaDisplay(meta), meta.composer].filter(Boolean).join('  ·  ')}
        </div>
        {(meta.arohanam || meta.avarohanam) && (
          <div className="print-raga-info">
            {meta.melakarta && <span><em>Melakarta:</em> {meta.melakarta} · </span>}
            {meta.isJanya && meta.janyaParent && <span><em>Janya of:</em> {meta.janyaParent} · </span>}
            {meta.arohanam && <span><em>Ā:</em> {meta.arohanam} · </span>}
            {meta.avarohanam && <span><em>Av:</em> {meta.avarohanam}</span>}
          </div>
        )}
      </div>

      <div className="metadata-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 24px' }}>
        <FieldGroup label="Song Name">
          <input className="field-input" type="text" value={meta.name} placeholder="e.g. Vataapi Ganapatim Bhaje" onChange={(e) => update('name', e.target.value)} />
        </FieldGroup>

        <FieldGroup label="Ragam">
          <input className="field-input" type="text" value={meta.ragam} placeholder="e.g. Hamsadhwani" onChange={(e) => update('ragam', e.target.value)} />
        </FieldGroup>

        <FieldGroup label="Composer">
          <input className="field-input" type="text" value={meta.composer} placeholder="e.g. Muthuswami Dikshitar" onChange={(e) => update('composer', e.target.value)} />
        </FieldGroup>

        {/* Talam — full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <TalaPicker />
        </div>

        {/* Kalai */}
        <FieldGroup label="Kalai (Speed)">
          <div style={{ display: 'flex', border: '1.5px solid rgba(107,30,46,0.25)', borderRadius: 4, overflow: 'hidden', background: 'var(--parchment)' }}>
            {([1, 2] as const).map((k) => (
              <button key={k} onClick={() => update('kalai', k)} style={{
                flex: 1, textAlign: 'center', padding: '7px 10px',
                fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                borderRight: k === 1 ? '1.5px solid rgba(107,30,46,0.2)' : 'none',
                background: meta.kalai === k ? 'var(--burgundy)' : 'transparent',
                color: meta.kalai === k ? 'var(--parchment)' : 'var(--ink-light)',
              }}>
                {k}× {k === 1 ? 'Normal' : 'Double'}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Gathi */}
        <FieldGroup label="Gathi (Maatras/Beat)">
          <input className="field-input" type="number" min={1} max={9} value={meta.maatras} onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1 && v <= 9) update('maatras', v) }} />
        </FieldGroup>

        {/* Raga info toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={() => setShowRagaInfo(v => !v)} style={{
            background: showRagaInfo ? 'var(--parchment-dark)' : 'transparent',
            border: '1.5px solid rgba(107,30,46,0.2)', borderRadius: 4,
            color: 'var(--burgundy)', fontFamily: 'var(--font-ui)', fontSize: 12,
            fontWeight: 600, padding: '7px 14px', cursor: 'pointer', transition: 'all 0.15s',
            letterSpacing: '0.04em',
          }}>
            {showRagaInfo ? '▾' : '▸'} Raga Overview
          </button>
        </div>
      </div>

      {/* Raga Info Section */}
      {showRagaInfo && (
        <div style={{
          marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(201,151,58,0.3)',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px',
        }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--gold)', fontStyle: 'italic', letterSpacing: '0.08em' }}>
              ◆ Raga Overview
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-light)', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!meta.isJanya} onChange={(e) => update('isJanya', e.target.checked)} style={{ accentColor: 'var(--burgundy)' }} />
              Janya raga
            </label>
          </div>

          <FieldGroup label="Melakarta">
            <input className="field-input" type="text" value={meta.melakarta || ''} placeholder="e.g. 29 · Sankarabharanam" onChange={(e) => update('melakarta', e.target.value)} />
          </FieldGroup>

          {meta.isJanya && (
            <FieldGroup label="Janya of (Parent Raga)">
              <input className="field-input" type="text" value={meta.janyaParent || ''} placeholder="e.g. Kharaharapriya" onChange={(e) => update('janyaParent', e.target.value)} />
            </FieldGroup>
          )}

          <FieldGroup label="Arohanam (Ascending)">
            <input className="field-input" type="text" value={meta.arohanam || ''} placeholder="e.g. S R2 G3 M1 P D2 N3 Ṡ" onChange={(e) => update('arohanam', e.target.value)} style={{ fontFamily: 'var(--font-serif)' }} />
          </FieldGroup>

          <FieldGroup label="Avarohanam (Descending)">
            <input className="field-input" type="text" value={meta.avarohanam || ''} placeholder="e.g. Ṡ N3 D2 P M1 G3 R2 S" onChange={(e) => update('avarohanam', e.target.value)} style={{ fontFamily: 'var(--font-serif)' }} />
          </FieldGroup>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .metadata-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .metadata-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}

function getTalaDisplay(meta: { talaBase?: string; jathi?: string; kalai?: number }) {
  const { talaBase = '', jathi = '', kalai = 1 } = meta
  if (!talaBase) return ''
  const names: Record<string, string> = {
    triputa: 'Triputa', rupaka: 'Rupaka', dhruva: 'Dhruva',
    matya: 'Matya', eka: 'Eka', jhampa: 'Jhampa', ata: 'Ata',
    misra_chapu: 'Misra Chapu', khanda_chapu: 'Khanda Chapu', rupaka_traditional: 'Rupaka (Trad.)',
  }
  const jathiNames: Record<string, string> = {
    tisra: 'Tisra', chaturasra: 'Chatusra', khanda: 'Khanda', misra: 'Misra', sankeerna: 'Sankeerna',
  }
  const talaPart = ['misra_chapu', 'khanda_chapu', 'rupaka_traditional'].includes(talaBase)
    ? (names[talaBase] || talaBase)
    : `${jathiNames[jathi] || jathi} Jati ${names[talaBase] || talaBase}`
  return kalai === 2 ? `${talaPart} (Kalai 2)` : talaPart
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--burgundy)', opacity: 0.8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
