'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, doc, addDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { useComposition } from '@/context/CompositionContext'
import { serializeState } from '@/lib/storage'
import { getBeatCount, getTalaName, TalaBase, Jathi } from '@/lib/tala'
import { stripUndefined } from '@/lib/firestore-utils'
import MetadataPanel from './MetadataPanel'
import PrintHeader from './PrintHeader'
import NotationGrid from './NotationGrid'
import Toolbar from './Toolbar'
import PlaybackBar from './PlaybackBar'
import HelpPanel from './HelpPanel'
import AuthModal from './AuthModal'

type Props = { cloudId: string | null }

export default function Editor({ cloudId }: Props) {
  const { state, dispatch, setSaveIndicator } = useComposition()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [showHelp, setShowHelp] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [playbackCell, setPlaybackCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => { setDarkMode(localStorage.getItem('notational_dark') === 'true') }, [])
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('notational_dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, (u) => { setUser(u); setAuthLoaded(true) })
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { setShowHelp(false); setShowAuth(false); return }
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(tag)) setShowHelp((v) => !v)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Sync cloudId from prop into state
  useEffect(() => {
    if (cloudId && cloudId !== state.cloudId) {
      dispatch({ type: 'SET_CLOUD_ID', cloudId })
    }
  }, [cloudId, state.cloudId, dispatch])

  const handleSaveCloud = useCallback(async () => {
    if (!user) { setShowAuth(true); return }
    const db = getFirebaseDb()
    const data = serializeState(state)
    const notRows = state.rows.filter((r) => r.type === 'notation')
    const payload = {
      uid: user.uid,
      name: state.meta.name || 'Untitled',
      ragam: state.meta.ragam || '',
      composer: state.meta.composer || '',
      talaBase: state.meta.talaBase,
      jathi: state.meta.jathi,
      kalai: state.meta.kalai,
      maatras: state.meta.maatras,
      // Raga info
      melakarta: state.meta.melakarta || '',
      arohanam: state.meta.arohanam || '',
      avarohanam: state.meta.avarohanam || '',
      isJanya: state.meta.isJanya || false,
      janyaParent: state.meta.janyaParent || '',
      rows: data.rows,
      avartanamCount: notRows.length,
      isPublic: state.isPublic || false,
      shareId: state.shareId || null,
    }
    try {
      // Strip undefined BEFORE adding server timestamps — stripUndefined must
      // never touch the serverTimestamp() FieldValue sentinels or it corrupts them.
      const cleanPayload = stripUndefined(payload)
      if (state.cloudId) {
        await updateDoc(doc(db, 'compositions', state.cloudId), {
          ...cleanPayload, updatedAt: serverTimestamp(),
        })
        setSaveIndicator('Saved to cloud ✓')
      } else {
        const ref = await addDoc(collection(db, 'compositions'), {
          ...cleanPayload, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        })
        dispatch({ type: 'SET_CLOUD_ID', cloudId: ref.id })
        router.replace(`/compose/${ref.id}`)
        setSaveIndicator('Saved to cloud ✓')
      }
    } catch (e: unknown) {
      console.error('Cloud save failed:', e)
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (msg.includes('permission') || msg.includes('Missing or insufficient')) {
        setSaveIndicator('Permission denied — check Firestore rules')
      } else {
        setSaveIndicator('Cloud save failed: ' + msg.slice(0, 60))
      }
    }
  }, [user, state, dispatch, setSaveIndicator, router])

  const handleShare = useCallback(async () => {
    if (!user) { setShowAuth(true); return }
    if (!state.cloudId) {
      await handleSaveCloud()
      return
    }
    try {
      const db = getFirebaseDb()
      const shareId = state.shareId || Math.random().toString(36).slice(2, 10)
      await updateDoc(doc(db, 'compositions', state.cloudId), {
        isPublic: true, shareId, updatedAt: serverTimestamp(),
      })
      dispatch({ type: 'SET_PUBLIC', isPublic: true, shareId })
      const url = `${window.location.origin}/share/${state.cloudId}`
      setShareUrl(url)
      await navigator.clipboard.writeText(url).catch(() => {})
      setSaveIndicator('Share link copied to clipboard!')
    } catch (e) {
      console.error('Share failed:', e)
      setSaveIndicator('Share failed')
    }
  }, [user, state, dispatch, setSaveIndicator, handleSaveCloud])

  const talaBase = state.meta.talaBase as TalaBase
  const jathi = state.meta.jathi as Jathi
  const beatCount = getBeatCount(talaBase, jathi, state.meta.kalai)
  const talaName = getTalaName(talaBase, jathi)

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px 20px 80px' }}>
      {/* Header */}
      <header className="no-print" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, paddingBottom: 14, borderBottom: '2px solid var(--gold)',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" style={{ color: 'var(--gold)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)' }}>← Dashboard</a>
          <a href="/about" style={{ color: 'var(--ink-faint)', fontSize: 12, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>About</a>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--burgundy)', fontStyle: 'italic' }}>Notational</div>
            <div style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
              Carnatic Music Notation
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {authLoaded && (user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--gold)' }} />}
              <span style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>{user.displayName || user.email}</span>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => signOut(getFirebaseAuth())}>Sign out</button>
            </div>
          ) : (
            <button className="btn btn-gold" onClick={() => setShowAuth(true)}>☁ Sign in</button>
          ))}
          <button className="btn btn-icon btn-secondary" onClick={() => setDarkMode(d => !d)} title="Dark mode">{darkMode ? '☀' : '☽'}</button>
          <button className="btn btn-icon btn-secondary" onClick={() => setShowHelp(v => !v)} title="Shortcuts (?)">?</button>
        </div>
      </header>

      {/* Share URL toast */}
      {shareUrl && (
        <div className="no-print" style={{
          background: 'var(--parchment-dark)', border: '1.5px solid var(--gold)',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
        }}>
          <span style={{ color: 'var(--gold)' }}>🔗</span>
          <span style={{ fontFamily: 'monospace', color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{shareUrl}</span>
          <button className="btn btn-gold" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</button>
          <button onClick={() => setShareUrl(null)} style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      )}

      <MetadataPanel />

      {/* Print-only header: song name, ragam, talam, composer, raga info */}
      <PrintHeader />

      <Toolbar
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
        onZoomOut={() => setZoom((z) => Math.max(0.25, +(z - 0.15).toFixed(2)))}
        onZoomReset={() => setZoom(1.0)}
        darkMode={darkMode}
        onDarkToggle={() => setDarkMode((d) => !d)}
        onHelpToggle={() => setShowHelp((v) => !v)}
        onSaveCloud={handleSaveCloud}
        onShare={handleShare}
        isLoggedIn={!!user}
      />

      <PlaybackBar onPlaybackCell={setPlaybackCell} />

      {/* Grid info */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink)', fontStyle: 'italic' }}>
          {talaName} · Kalai {state.meta.kalai} · {beatCount} beats · {state.meta.maatras} maatras/beat
        </div>
        {state.meta.kalai === 2 && (
          <span style={{
            background: 'linear-gradient(135deg, var(--gold), #B8820A)', color: 'white',
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase',
          }}>Kalai 2</span>
        )}
        {state.isPublic && (
          <span style={{ background: 'rgba(90,138,58,0.15)', color: '#5A8A3A', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Public
          </span>
        )}
      </div>

      <NotationGrid zoom={zoom} playbackCell={playbackCell} />

      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
