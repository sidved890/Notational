'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { CompositionProvider, useComposition } from '@/context/CompositionContext'
import { serializeState } from '@/lib/storage'
import { getTalaPattern, getBeatCount, TalaBase, Jathi, getTalaName } from '@/lib/tala'
import MetadataPanel from '@/components/MetadataPanel'
import NotationGrid from '@/components/NotationGrid'
import Toolbar from '@/components/Toolbar'
import PlaybackBar from '@/components/PlaybackBar'
import HelpPanel from '@/components/HelpPanel'
import AuthModal from '@/components/AuthModal'
import CompositionsPanel from '@/components/CompositionsPanel'

// Inner component that uses context
function AppInner() {
  const { state, dispatch, setSaveIndicator } = useComposition()

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)

  // UI state
  const [darkMode, setDarkMode] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [showHelp, setShowHelp] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showCompositions, setShowCompositions] = useState(false)
  const [playbackCell, setPlaybackCell] = useState<{
    rowIndex: number
    cellIndex: number
  } | null>(null)

  // Init dark mode from localStorage
  useEffect(() => {
    const dark = localStorage.getItem('notational_dark') === 'true'
    setDarkMode(dark)
  }, [])

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('notational_dark', String(darkMode))
  }, [darkMode])

  // Firebase auth listener
  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoaded(true)
    })
    return () => unsubscribe()
  }, [])

  // Global ? key for help
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowHelp(false)
        setShowAuth(false)
        setShowCompositions(false)
        return
      }
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(tag)) {
        setShowHelp((v) => !v)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  async function handleSaveCloud() {
    if (!user) {
      setShowAuth(true)
      return
    }
    const db = getFirebaseDb()
    const data = serializeState(state)
    const notRows = state.rows.filter((r) => r.type === 'notation')
    const doc_data = {
      uid: user.uid,
      name: state.meta.name || 'Untitled',
      ragam: state.meta.ragam || '',
      composer: state.meta.composer || '',
      talaBase: state.meta.talaBase,
      jathi: state.meta.jathi,
      kalai: state.meta.kalai,
      maatras: state.meta.maatras,
      rows: data.rows,
      avartanamCount: notRows.length,
      updatedAt: serverTimestamp(),
    }
    try {
      if (state.cloudId) {
        await updateDoc(doc(db, 'compositions', state.cloudId), doc_data)
      } else {
        const ref = await addDoc(collection(db, 'compositions'), {
          ...doc_data,
          createdAt: serverTimestamp(),
        })
        dispatch({ type: 'SET_CLOUD_ID', cloudId: ref.id })
      }
      setSaveIndicator('Saved to cloud ✓')
    } catch (e) {
      console.error('Cloud save failed:', e)
      setSaveIndicator('Cloud save failed')
    }
  }

  function handleSignOut() {
    const auth = getFirebaseAuth()
    signOut(auth)
  }

  const talaBase = state.meta.talaBase as TalaBase
  const jathi = state.meta.jathi as Jathi
  const kalai = state.meta.kalai
  const beatCount = getBeatCount(talaBase, jathi, kalai)
  const talaName = getTalaName(talaBase, jathi)

  return (
    <div
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '20px 20px 80px',
        background: 'var(--parchment)',
        minHeight: '100vh',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          paddingBottom: 14,
          borderBottom: '2px solid var(--gold)',
          gap: 12,
          flexWrap: 'wrap',
        }}
        className="no-print"
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              color: 'var(--burgundy)',
              letterSpacing: '0.04em',
              fontStyle: 'italic',
            }}
          >
            Notational
          </div>
          <div
            style={{
              fontStyle: 'normal',
              color: 'var(--gold)',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-ui)',
              marginTop: -2,
            }}
          >
            Carnatic Music Notation System
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Auth section */}
          {authLoaded && (
            <>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  {user.photoURL && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="auth-avatar"
                      src={user.photoURL}
                      alt=""
                    />
                  )}
                  <span style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>
                    {user.displayName || user.email}
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button className="btn btn-gold" onClick={() => setShowAuth(true)}>
                  ☁ Sign in
                </button>
              )}
            </>
          )}

          {user && (
            <button
              className="btn btn-gold"
              onClick={() => setShowCompositions(true)}
            >
              ☁ My Compositions
            </button>
          )}
        </div>
      </header>

      {/* METADATA PANEL */}
      <MetadataPanel />

      {/* TOOLBAR */}
      <Toolbar
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
        onZoomOut={() => setZoom((z) => Math.max(0.25, +(z - 0.15).toFixed(2)))}
        onZoomReset={() => setZoom(1.0)}
        darkMode={darkMode}
        onDarkToggle={() => setDarkMode((d) => !d)}
        onHelpToggle={() => setShowHelp((v) => !v)}
        onSaveCloud={handleSaveCloud}
        isLoggedIn={!!user}
      />

      {/* PLAYBACK BAR */}
      <PlaybackBar onPlaybackCell={setPlaybackCell} />

      {/* GRID */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
          className="no-print"
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              color: 'var(--ink)',
              fontStyle: 'italic',
            }}
          >
            {talaName} · Kalai {kalai} · {beatCount} beats · {state.meta.maatras} maatras/beat
          </div>
          {kalai === 2 && (
            <span
              style={{
                background: 'linear-gradient(135deg, var(--gold), #B8820A)',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: 10,
                fontFamily: 'var(--font-ui)',
              }}
            >
              Kalai 2
            </span>
          )}
        </div>

        <NotationGrid zoom={zoom} playbackCell={playbackCell} />
      </div>

      {/* MODALS */}
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <CompositionsPanel
        isOpen={showCompositions}
        onClose={() => setShowCompositions(false)}
        user={user}
        onNew={() => dispatch({ type: 'NEW_COMPOSITION' })}
      />
    </div>
  )
}

export default function Home() {
  return (
    <CompositionProvider>
      <AppInner />
    </CompositionProvider>
  )
}
