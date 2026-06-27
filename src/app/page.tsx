'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection, query, where, getDocs, deleteDoc, updateDoc, doc,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase'
import { CloudComposition } from '@/lib/types'
import { getTalaName, TalaBase, Jathi } from '@/lib/tala'
import AuthModal from '@/components/AuthModal'
import ThemePicker from '@/components/ThemePicker'
import { useTheme } from '@/hooks/useTheme'

const FOLDERS_KEY = 'notational_folders'
// activeFolder sentinels: null = All, '' = Unfiled, any other string = that folder
type ActiveFolder = string | null

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
  const { theme, setTheme } = useTheme()
  const [customFolders, setCustomFolders] = useState<string[]>([])
  const [activeFolder, setActiveFolder] = useState<ActiveFolder>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FOLDERS_KEY)
      if (raw) setCustomFolders(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

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

  function persistFolders(next: string[]) {
    setCustomFolders(next)
    try { localStorage.setItem(FOLDERS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  // Full folder list: union of locally-created folders and folders already in use.
  const allFolders = useMemo(() => {
    const set = new Set<string>(customFolders)
    for (const c of compositions) {
      if (c.folder) set.add(c.folder)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [customFolders, compositions])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    let unfiled = 0
    for (const c of compositions) {
      if (c.folder) map[c.folder] = (map[c.folder] || 0) + 1
      else unfiled++
    }
    return { map, unfiled }
  }, [compositions])

  const visible = useMemo(() => {
    if (activeFolder === null) return compositions
    if (activeFolder === '') return compositions.filter((c) => !c.folder)
    return compositions.filter((c) => c.folder === activeFolder)
  }, [compositions, activeFolder])

  function createFolder() {
    const name = prompt('New folder name:')?.trim()
    if (!name) return
    if (!allFolders.includes(name)) persistFolders([...customFolders, name])
    setActiveFolder(name)
  }

  function deleteFolder(name: string) {
    if (counts.map[name]) {
      alert(`"${name}" still has compositions. Move them out first.`)
      return
    }
    persistFolders(customFolders.filter((f) => f !== name))
    if (activeFolder === name) setActiveFolder(null)
  }

  async function moveToFolder(compId: string, folder: string | null) {
    setMenuOpenId(null)
    setCompositions((prev) => prev.map((c) => (c.id === compId ? { ...c, folder } : c)))
    if (folder && !allFolders.includes(folder)) persistFolders([...customFolders, folder])
    try {
      await updateDoc(doc(getFirebaseDb(), 'compositions', compId), { folder: folder ?? null })
    } catch (err) {
      console.error('Failed to move composition:', err)
    }
  }

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

  const activeLabel = activeFolder === null ? 'All Compositions' : activeFolder === '' ? 'Unfiled' : activeFolder

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
          <a href="/tutorial" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>Tutorial</a>
          <a href="/about" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>About</a>
          <ThemePicker theme={theme} onThemeChange={setTheme} compact />
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
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
        ) : (
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Folder sidebar */}
            <aside style={{ width: 210, minWidth: 180, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>Folders</span>
                <button onClick={createFolder} title="New folder" style={{
                  background: 'none', border: '1.5px solid rgba(201,151,58,0.4)', borderRadius: 4,
                  color: 'var(--burgundy)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: '2px 8px', fontWeight: 700,
                }}>+ New</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FolderItem label="All Compositions" count={compositions.length} active={activeFolder === null} onClick={() => setActiveFolder(null)} />
                <FolderItem label="Unfiled" count={counts.unfiled} active={activeFolder === ''} onClick={() => setActiveFolder('')} />
                {allFolders.length > 0 && <div style={{ height: 1, background: 'rgba(201,151,58,0.25)', margin: '8px 0' }} />}
                {allFolders.map((f) => (
                  <FolderItem
                    key={f}
                    label={f}
                    icon="🗀"
                    count={counts.map[f] || 0}
                    active={activeFolder === f}
                    onClick={() => setActiveFolder(f)}
                    onDelete={counts.map[f] ? undefined : () => deleteFolder(f)}
                  />
                ))}
              </div>
            </aside>

            {/* Composition area */}
            <section style={{ flex: 1, minWidth: 280 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 14 }}>
                {activeLabel} <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>· {visible.length}</span>
              </h2>

              {loading ? (
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
              ) : visible.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px 20px',
                  background: 'var(--parchment-dark)', borderRadius: 12,
                  border: '1.5px dashed rgba(201,151,58,0.4)',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 10 }}>
                    {compositions.length === 0 ? 'No compositions yet' : 'Nothing in this folder'}
                  </div>
                  <button className="btn btn-primary" onClick={createNew}>+ Create a composition</button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 16,
                }}>
                  {visible.map((comp) => {
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

                            {/* Move-to-folder menu */}
                            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setMenuOpenId(menuOpenId === comp.id ? null : comp.id)}
                                title="Move to folder"
                                style={{
                                  background: comp.folder ? 'rgba(201,151,58,0.18)' : 'none',
                                  border: comp.folder ? '1px solid var(--gold)' : 'none',
                                  color: comp.folder ? 'var(--gold)' : 'var(--ink-faint)',
                                  cursor: 'pointer', fontSize: 12, padding: '1px 6px', borderRadius: 6,
                                  fontWeight: 700, lineHeight: 1.5, maxWidth: 90,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                              >
                                {comp.folder ? `🗀 ${comp.folder}` : '🗀 Folder'}
                              </button>
                              {menuOpenId === comp.id && (
                                <>
                                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMenuOpenId(null)} />
                                  <div style={{
                                    position: 'absolute', top: '100%', right: 0, zIndex: 50, marginTop: 4,
                                    background: 'var(--parchment)', border: '1.5px solid var(--gold)',
                                    borderRadius: 6, padding: 6, boxShadow: '0 4px 12px var(--shadow)',
                                    display: 'flex', flexDirection: 'column', gap: 2, minWidth: 150, maxHeight: 240, overflowY: 'auto',
                                  }}>
                                    <div style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 6px' }}>Move to</div>
                                    <MenuItem label="Unfiled" active={!comp.folder} onClick={() => moveToFolder(comp.id, null)} />
                                    {allFolders.map((f) => (
                                      <MenuItem key={f} label={f} active={comp.folder === f} onClick={() => moveToFolder(comp.id, f)} />
                                    ))}
                                    <div style={{ height: 1, background: 'rgba(201,151,58,0.25)', margin: '4px 0' }} />
                                    <MenuItem label="+ New folder…" onClick={() => {
                                      const name = prompt('New folder name:')?.trim()
                                      if (name) moveToFolder(comp.id, name)
                                      else setMenuOpenId(null)
                                    }} />
                                  </div>
                                </>
                              )}
                            </div>

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
            </section>
          </div>
        )}
      </main>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}

function FolderItem({ label, count, active, onClick, onDelete, icon }: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  onDelete?: () => void
  icon?: string
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        padding: '6px 10px', borderRadius: 6, transition: 'background 0.15s',
        background: active ? 'rgba(107,30,46,0.1)' : 'transparent',
        border: active ? '1.5px solid rgba(107,30,46,0.3)' : '1.5px solid transparent',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--gold-faint)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
      <span style={{
        flex: 1, fontSize: 13, fontFamily: 'var(--font-ui)', fontWeight: active ? 700 : 500,
        color: active ? 'var(--burgundy)' : 'var(--ink-light)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600 }}>{count}</span>
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          title="Delete empty folder"
          style={{ background: 'none', border: 'none', color: 'var(--ink-faint)', cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1 }}
        >×</button>
      )}
    </div>
  )
}

function MenuItem({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? 'var(--burgundy)' : 'transparent',
        color: active ? 'var(--parchment)' : 'var(--ink)',
        fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-ui)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
