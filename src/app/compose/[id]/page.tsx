'use client'

import { use, useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { User, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { deserializeState } from '@/lib/storage'
import { CompositionState } from '@/lib/types'
import { CompositionProvider } from '@/context/CompositionContext'
import Editor from '@/components/Editor'
import CompositionReadOnlyView from '@/components/CompositionReadOnlyView'

export default function ComposePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [docLoaded, setDocLoaded] = useState(false)
  const [initialData, setInitialData] = useState<CompositionState | undefined>()
  const [ownerUid, setOwnerUid] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [creatorName, setCreatorName] = useState<string | undefined>()
  const [error, setError] = useState('')

  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (u) => { setUser(u); setAuthLoaded(true) })
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(getFirebaseDb(), 'compositions', id))
        if (!snap.exists()) { setError('Composition not found.'); return }
        const d = snap.data()
        setOwnerUid(d.uid || null)
        setIsPublic(!!d.isPublic)
        setCreatorName(d.creatorName || undefined)
        setInitialData(deserializeState({ ...d, cloudId: id }))
      } catch (e) {
        console.error(e)
        setError('Failed to load composition.')
      } finally {
        setDocLoaded(true)
      }
    }
    load()
  }, [id])

  if (!docLoaded || !authLoaded) {
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
        <a href="/dashboard" className="btn btn-secondary">← Back to Dashboard</a>
      </div>
    )
  }

  const isOwner = !!user && !!ownerUid && user.uid === ownerUid

  if (!isOwner && !isPublic) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, background: 'var(--parchment)' }}>
        <div style={{ color: 'var(--burgundy)', fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic' }}>This composition is not publicly shared.</div>
        <a href="/" className="btn btn-secondary">← Back to Notational</a>
      </div>
    )
  }

  if (!isOwner && isPublic) {
    return (
      <CompositionProvider initialData={initialData}>
        <CompositionReadOnlyView state={initialData!} creatorName={creatorName} />
      </CompositionProvider>
    )
  }

  return (
    <CompositionProvider initialData={initialData}>
      <Editor cloudId={id} />
    </CompositionProvider>
  )
}
