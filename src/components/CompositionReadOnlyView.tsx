'use client'

import { CompositionState } from '@/lib/types'
import { getTalaName, getBeatCount, TalaBase, Jathi } from '@/lib/tala'
import NotationGrid from '@/components/NotationGrid'

type Props = {
  state: CompositionState
  creatorName?: string
  backHref?: string
}

export default function CompositionReadOnlyView({ state, creatorName, backHref = '/' }: Props) {
  const { meta } = state
  const talaName = getTalaName(meta.talaBase as TalaBase, meta.jathi as Jathi)
  const beatCount = getBeatCount(meta.talaBase as TalaBase, meta.jathi as Jathi, meta.kalai)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Title block */}
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '2px solid var(--gold)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', fontStyle: 'italic', marginBottom: 4 }}>
              {meta.name || 'Untitled'}
            </h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {meta.ragam && <span style={{ color: 'var(--burgundy)', fontFamily: 'var(--font-serif)', fontSize: 15, fontStyle: 'italic' }}>{meta.ragam}</span>}
              {meta.composer && <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>— {meta.composer}</span>}
              <span style={{ background: 'rgba(107,30,46,0.08)', color: 'var(--burgundy)', fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 600 }}>
                {talaName} · {beatCount} beats
              </span>
              {meta.kalai === 2 && <span style={{ background: 'linear-gradient(135deg, var(--gold), #B8820A)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase' }}>Kalai 2</span>}
            </div>
            {creatorName && (
              <div style={{ marginTop: 6, color: 'var(--ink-faint)', fontSize: 12, fontStyle: 'italic' }}>
                by {creatorName}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={backHref} className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>← Notational</a>
            <button className="btn btn-gold" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => window.print()}>⎙ Print</button>
          </div>
        </div>

        {/* Raga info block */}
        {(meta.arohanam || meta.avarohanam || meta.melakarta) && (
          <div style={{
            marginTop: 14, padding: '10px 16px',
            background: 'var(--parchment-dark)', borderRadius: 6,
            border: '1px solid rgba(201,151,58,0.3)',
            display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
          }}>
            {meta.melakarta && (
              <div style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Melakarta </span>
                <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>{meta.melakarta}</span>
              </div>
            )}
            {meta.isJanya && meta.janyaParent && (
              <div style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Janya of </span>
                <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)', fontStyle: 'italic' }}>{meta.janyaParent}</span>
              </div>
            )}
            {meta.arohanam && (
              <div style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ā </span>
                <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>{meta.arohanam}</span>
              </div>
            )}
            {meta.avarohanam && (
              <div style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Av </span>
                <span style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink)' }}>{meta.avarohanam}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notation — read-only (no zoom/playback controls in this view) */}
      <NotationGrid zoom={1} playbackCell={null} readOnly />
    </div>
  )
}
