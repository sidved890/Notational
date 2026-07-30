'use client'

import { use, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import { deserializeState } from '@/lib/storage'
import { CompositionState } from '@/lib/types'
import { CompositionProvider } from '@/context/CompositionContext'
import CompositionReadOnlyView from '@/components/CompositionReadOnlyView'

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loaded, setLoaded] = useState(false)
  const [data, setData] = useState<CompositionState | null>(null)
  const [creatorName, setCreatorName] = useState<string | undefined>()
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), 'compositions', id))
        if (!snap.exists()) { setError('Composition not found.'); return }
        const d = snap.data()
        if (!d.isPublic) { setError('This composition is not publicly shared.'); return }
        setData(deserializeState({ ...d, cloudId: id }))
        setCreatorName(d.creatorName || undefined)
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
      <CompositionReadOnlyView state={data} creatorName={creatorName} />
    </CompositionProvider>
  )
}
