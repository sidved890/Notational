'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import { useComposition } from '@/context/CompositionContext'
import { deserializeState } from '@/lib/storage'
import { CloudComposition } from '@/lib/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onNew: () => void
}

export default function CompositionsPanel({ isOpen, onClose, user, onNew }: Props) {
  const { dispatch } = useComposition()
  const [compositions, setCompositions] = useState<CloudComposition[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !user) return
    setLoading(true)
    const db = getFirebaseDb()
    const q = query(
      collection(db, 'compositions'),
      where('uid', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(50)
    )
    getDocs(q)
      .then((snap) => {
        const items: CloudComposition[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CloudComposition, 'id'>),
        }))
        setCompositions(items)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isOpen, user])

  async function loadComposition(id: string) {
    const db = getFirebaseDb()
    try {
      const snap = await getDoc(doc(db, 'compositions', id))
      if (!snap.exists()) {
        alert('Composition not found.')
        return
      }
      const d = snap.data()
      const loaded = deserializeState({
        meta: {
          name: d.name,
          ragam: d.ragam,
          composer: d.composer,
          talaBase: d.talaBase || d.talam || 'triputa',
          jathi: d.jathi || 'chaturasra',
          kalai: d.kalai || 1,
          maatras: d.maatras || 2,
        },
        rows: d.rows,
        cloudId: snap.id,
      })
      dispatch({ type: 'LOAD_COMPOSITION', state: loaded })
      onClose()
    } catch (e) {
      console.error('Load failed:', e)
      alert('Failed to load composition.')
    }
  }

  async function deleteComposition(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Delete this composition?')) return
    const db = getFirebaseDb()
    try {
      await deleteDoc(doc(db, 'compositions', id))
      setCompositions((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--parchment)',
          border: '2px solid var(--gold)',
          borderRadius: 12,
          width: 380,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(42,26,14,0.35)',
          marginTop: 60,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px 14px',
            borderBottom: '1px solid rgba(201,151,58,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              color: 'var(--burgundy)',
              fontStyle: 'italic',
            }}
          >
            My Compositions
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: 'var(--ink-faint)',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {!user ? (
            <p
              style={{
                textAlign: 'center',
                padding: 24,
                color: 'var(--ink-faint)',
                fontStyle: 'italic',
                fontSize: 13,
              }}
            >
              Sign in to view your saved compositions.
            </p>
          ) : loading ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--ink-faint)',
                fontStyle: 'italic',
                fontSize: 13,
              }}
            >
              Loading…
            </p>
          ) : compositions.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                padding: 24,
                color: 'var(--ink-faint)',
                fontStyle: 'italic',
                fontSize: 13,
              }}
            >
              No compositions yet.
              <br />
              Save your work with &quot;Save to Cloud&quot;.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {compositions.map((comp) => (
                <li
                  key={comp.id}
                  onClick={() => loadComposition(comp.id)}
                  style={{
                    padding: '10px 14px',
                    border: '1.5px solid rgba(201,151,58,0.3)',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'var(--gold-faint)'
                    el.style.borderColor = 'var(--gold)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = ''
                    el.style.borderColor = 'rgba(201,151,58,0.3)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}
                    >
                      {comp.name || 'Untitled'}
                    </div>
                    <div
                      style={{ fontSize: 12, color: 'var(--ink-faint)', fontStyle: 'italic', marginTop: 2 }}
                    >
                      {comp.ragam ? `${comp.ragam} · ` : ''}
                      {comp.talaBase || comp.ragam || ''}
                      {comp.avartanamCount ? ` · ${comp.avartanamCount} avartahanams` : ''}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteComposition(e, comp.id)}
                    title="Delete"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ink-faint)',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: '0 4px',
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {user && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(201,151,58,0.3)',
              display: 'flex',
              gap: 8,
            }}
          >
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                onNew()
                onClose()
              }}
            >
              + New Composition
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
