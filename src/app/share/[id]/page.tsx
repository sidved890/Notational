'use client'

import { use, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import { deserializeState } from '@/lib/storage'
import { CompositionState } from '@/lib/types'
import { CompositionProvider } from '@/context/CompositionContext'
import NotationGrid from '@/components/NotationGrid'
import { getTalaName, getBeatCount, TalaBase, Jathi } from '@/lib/tala'

function ShareView({ state }: { state: CompositionState }) {
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
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/" className="btn btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}>← Notational</a>
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

      {/* Notation — read-only (no zoom/playback controls in share view) */}
      <NotationGrid zoom={1} playbackCell={null} />
    </div>
  )
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState<CompositionState | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), 'compositions', id))
        if (!snap.exists()) { setError('Composition not found.'); return }
        const d = snap.data()
        if (!d.isPublic) { setError('This composition is not publicly shared.'); return }
        setData(deserializeState({ ...d, cloudId: id }))
      } catch (e) {
        console.error(e)
        setError('Failed to load composition.')
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [id])

  if (!loaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--parchment)', color: 'var(--ink-faint)', fontStyle: 'italic' }}>Loading…</div>
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, background: 'var(--parchment)' }}>
        <div style={{ color: 'var(--burgundy)', fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic' }}>{error || 'Not found'}</div>
        <a href="/" className="btn btn-secondary">← Back to Notational</a>
      </div>
    )
  }

  return (
    <CompositionProvider initialData={data}>
      <ShareView state={data} />
    </CompositionProvider>
  )
}
