'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, query, where, getDocs, deleteDoc, doc,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { CloudComposition } from '@/lib/types'
import { getTalaName, TalaBase, Jathi } from '@/lib/tala'
import AuthModal from '@/components/AuthModal'

function fmtDate(comp: CloudComposition) {
  const d = comp.updatedAt?.toDate?.()
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [compositions, setCompositions] = useState<CloudComposition[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setDarkMode(localStorage.getItem('notational_dark') === 'true')
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('notational_dark', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!user) { setCompositions([]); return }
    setLoading(true)
    setLoadError('')
    const db = getFirebaseDb()
    // Filter by uid only — sorting is done client-side so this query needs no
    // composite index (where + orderBy would require one, and the silent
    // failure left the dashboard empty even after a successful save).
    const q = query(collection(db, 'compositions'), where('uid', '==', user.uid))
    getDocs(q)
      .then((snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CloudComposition, 'id'>) }))
        items.sort((a, b) => (b.updatedAt?.toDate?.()?.getTime() ?? 0) - (a.updatedAt?.toDate?.()?.getTime() ?? 0))
        setCompositions(items.slice(0, 50))
      })
      .catch((err) => {
        console.error(err)
        setLoadError(err instanceof Error ? err.message : 'Failed to load compositions.')
      })
      .finally(() => setLoading(false))
  }, [user])

  async function createNew() {
    router.push('/compose/new')
  }

  async function openComposition(id: string) {
    router.push(`/compose/${id}`)
  }

  async function deleteComposition(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this composition?')) return
    try {
      await deleteDoc(doc(getFirebaseDb(), 'compositions', id))
      setCompositions((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '2px solid var(--gold)',
        background: 'linear-gradient(to bottom, var(--parchment-dark), var(--parchment))',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--burgundy)', fontStyle: 'italic' }}>
            Notational
          </div>
          <div style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
            Carnatic Music Notation System
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/about" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>About</a>
          <button className="btn btn-icon btn-secondary" onClick={() => setDarkMode(d => !d)} title="Toggle dark mode">
            {darkMode ? '☀' : '☽'}
          </button>
          {authLoaded && (
            user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--gold)' }} />}
                <span style={{ color: 'var(--ink-light)', fontStyle: 'italic', fontSize: 13 }}>{user.displayName || user.email}</span>
                <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => signOut(getFirebaseAuth())}>
                  Sign out
                </button>
              </div>
            ) : (
              <button className="btn btn-gold" onClick={() => setShowAuth(true)}>☁ Sign in</button>
            )
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Hero / new composition */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', fontStyle: 'italic', marginBottom: 4 }}>
              {user ? `Welcome back${user.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}` : 'Your Compositions'}
            </h1>
            <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontStyle: 'italic' }}>
              {user ? 'All your notations, saved to the cloud.' : 'Sign in to save compositions to the cloud.'}
            </p>
          </div>
          <button className="btn btn-primary" style={{ fontSize: 15, padding: '10px 24px' }} onClick={createNew}>
            + New Composition
          </button>
        </div>

        {/* Composition grid */}
        {!user ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--parchment-dark)', borderRadius: 12,
            border: '1.5px dashed rgba(201,151,58,0.4)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 12 }}>
              Sign in to see your compositions
            </div>
            <p style={{ color: 'var(--ink-faint)', fontSize: 14, marginBottom: 20, fontStyle: 'italic' }}>
              Or start a new composition and save it later.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setShowAuth(true)}>☁ Sign in</button>
              <button className="btn btn-secondary" onClick={createNew}>Start without account</button>
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-faint)', fontStyle: 'italic' }}>Loading…</div>
        ) : loadError ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'rgba(192,57,43,0.06)', borderRadius: 12,
            border: '1.5px dashed rgba(192,57,43,0.4)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#c0392b', fontStyle: 'italic', marginBottom: 10 }}>
              Couldn’t load your compositions
            </div>
            <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-word' }}>{loadError}</p>
          </div>
        ) : compositions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--parchment-dark)', borderRadius: 12,
            border: '1.5px dashed rgba(201,151,58,0.4)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 10 }}>
              No compositions yet
            </div>
            <button className="btn btn-primary" onClick={createNew}>+ Create your first composition</button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {compositions.map((comp) => {
              const talaName = comp.talaBase
                ? getTalaName(comp.talaBase as TalaBase, (comp.jathi || 'chaturasra') as Jathi)
                : ''
              return (
                <div
                  key={comp.id}
                  onClick={() => openComposition(comp.id)}
                  style={{
                    background: 'linear-gradient(135deg, var(--parchment-dark), var(--parchment))',
                    border: '1.5px solid rgba(201,151,58,0.35)',
                    borderRadius: 10, padding: '18px 20px',
                    cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,151,58,0.35)')}
                >
                  {/* Share badge */}
                  {comp.isPublic && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'var(--gold)', color: 'white',
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                      padding: '2px 6px', borderRadius: 8, textTransform: 'uppercase',
                    }}>Public</span>
                  )}
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16,
                    color: 'var(--ink)', marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {comp.name || 'Untitled'}
                  </div>
                  {comp.ragam && (
                    <div style={{ color: 'var(--burgundy)', fontSize: 13, fontStyle: 'italic', marginBottom: 2 }}>{comp.ragam}</div>
                  )}
                  {comp.composer && (
                    <div style={{ color: 'var(--ink-faint)', fontSize: 12 }}>{comp.composer}</div>
                  )}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      background: 'rgba(107,30,46,0.08)', color: 'var(--burgundy)',
                      fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                    }}>{talaName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{fmtDate(comp)}</span>
                      <button
                        onClick={(e) => deleteComposition(comp.id, e)}
                        style={{
                          background: 'none', border: 'none', color: 'var(--ink-faint)',
                          cursor: 'pointer', fontSize: 14, padding: '0 2px',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--burgundy)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-faint)')}
                        title="Delete"
                      >×</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
