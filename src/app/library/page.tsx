'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import { CloudComposition } from '@/lib/types'
import { getTalaName, TalaBase, Jathi } from '@/lib/tala'
import ThemePicker from '@/components/ThemePicker'
import { useTheme } from '@/hooks/useTheme'

function fmtDate(comp: CloudComposition) {
  const d = comp.updatedAt?.toDate?.()
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function LibraryPage() {
  const { theme, setTheme } = useTheme()
  const [compositions, setCompositions] = useState<CloudComposition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const db = getFirebaseDb()
    const q = query(
      collection(db, 'compositions'),
      where('isPublic', '==', true),
      limit(60)
    )
    getDocs(q)
      .then(snap => {
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<CloudComposition, 'id'>) }))
        items.sort((a, b) => (b.updatedAt?.toDate?.()?.getTime() ?? 0) - (a.updatedAt?.toDate?.()?.getTime() ?? 0))
        setCompositions(items)
      })
      .catch(err => {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Failed to load library.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = search.trim()
    ? compositions.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.ragam || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.composer || '').toLowerCase().includes(search.toLowerCase())
      )
    : compositions

  return (
    <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '2px solid var(--gold)',
        background: 'linear-gradient(to bottom, var(--parchment-dark), var(--parchment))',
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-devanagari)', fontSize: 34, color: 'var(--burgundy)', lineHeight: 1 }}>न</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--burgundy)', fontStyle: 'italic' }}>
              Notational
            </div>
            <div style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
              Carnatic Music Notation System
            </div>
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>Dashboard</a>
          <a href="/tutorial" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>Tutorial</a>
          <a href="/about" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>About</a>
          <ThemePicker theme={theme} onThemeChange={setTheme} compact />
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.35 }} />
            <span style={{ color: 'var(--gold)', fontSize: 14 }}>◆</span>
            <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.35 }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 6 }}>
            Community Library
          </h1>
          <p style={{ color: 'var(--ink-faint)', fontSize: 14, fontStyle: 'italic', marginBottom: 24 }}>
            Public Carnatic compositions shared by the community. Open source, freely viewable.
          </p>
          <input
            type="text"
            placeholder="Search by name, ragam, or composer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 8,
              border: '1.5px solid rgba(201,151,58,0.4)',
              background: 'var(--parchment-dark)', color: 'var(--ink)', fontSize: 14,
              fontFamily: 'var(--font-ui)', width: '100%', maxWidth: 400, outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(201,151,58,0.4)')}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-faint)', fontStyle: 'italic' }}>
            Loading library…
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: 'rgba(192,57,43,0.06)', borderRadius: 12,
            border: '1.5px dashed rgba(192,57,43,0.4)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#c0392b', fontStyle: 'italic', marginBottom: 10 }}>
              Couldn&apos;t load the library
            </div>
            <p style={{ color: 'var(--ink-faint)', fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-word' }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--parchment-dark)', borderRadius: 12,
            border: '1.5px dashed rgba(201,151,58,0.4)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--burgundy)', fontStyle: 'italic', marginBottom: 10 }}>
              {search ? 'No results found' : 'No public compositions yet'}
            </div>
            {!search && (
              <p style={{ color: 'var(--ink-faint)', fontSize: 14, fontStyle: 'italic' }}>
                Create a composition and mark it public to share it here.
              </p>
            )}
          </div>
        ) : (
          <>
            <div style={{ color: 'var(--ink-faint)', fontSize: 12, marginBottom: 16, fontFamily: 'var(--font-ui)' }}>
              {filtered.length} composition{filtered.length !== 1 ? 's' : ''}
              {search && ` matching "${search}"`}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}>
              {filtered.map(comp => {
                const talaName = comp.talaBase
                  ? getTalaName(comp.talaBase as TalaBase, (comp.jathi || 'chaturasra') as Jathi)
                  : ''
                return (
                  <a key={comp.id} href={`/share/${comp.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, var(--parchment-dark), var(--parchment))',
                        border: '1.5px solid rgba(201,151,58,0.35)',
                        borderRadius: 10, padding: '18px 20px',
                        cursor: 'pointer', transition: 'border-color 0.15s',
                        height: '100%', boxSizing: 'border-box',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(201,151,58,0.35)')}
                    >
                      <div style={{
                        fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 16,
                        color: 'var(--ink)', marginBottom: 4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {comp.name || 'Untitled'}
                      </div>
                      {comp.ragam && (
                        <div style={{ color: 'var(--burgundy)', fontSize: 13, fontStyle: 'italic', marginBottom: 2 }}>
                          {comp.ragam}
                        </div>
                      )}
                      {comp.composer && (
                        <div style={{ color: 'var(--ink-faint)', fontSize: 12 }}>{comp.composer}</div>
                      )}
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          background: 'rgba(107,30,46,0.08)', color: 'var(--burgundy)',
                          fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                        }}>{talaName}</span>
                        <span style={{ color: 'var(--ink-faint)', fontSize: 11 }}>{fmtDate(comp)}</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 48 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.35 }} />
          <span style={{ color: 'var(--gold)', fontSize: 14 }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.35 }} />
        </div>
      </main>
    </div>
  )
}
