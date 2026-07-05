'use client'

import { use, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import { deserializeState } from '@/lib/storage'
import { CompositionState } from '@/lib/types'
import { CompositionProvider } from '@/context/CompositionContext'
import Editor from '@/components/Editor'

export default function ComposePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loaded, setLoaded] = useState(false)
  const [initialData, setInitialData] = useState<CompositionState | undefined>()
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), 'compositions', id))
        if (!snap.exists()) { setError('Composition not found.'); return }
        const data = deserializeState({ ...snap.data(), cloudId: id })
        setInitialData(data)
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
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--parchment)', color: 'var(--ink-faint)', fontStyle: 'italic', fontFamily: 'var(--font-ui)' }}>
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, background: 'var(--parchment)' }}>
        <div style={{ color: 'var(--burgundy)', fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic' }}>{error}</div>
        <a href="/" className="btn btn-secondary">← Back to Dashboard</a>
      </div>
    )
  }

  return (
    <CompositionProvider initialData={initialData}>
      <Editor cloudId={id} />
    </CompositionProvider>
  )
}
