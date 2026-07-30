'use client'

import { useState, useEffect } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import AuthModal from '@/components/AuthModal'
import ThemePicker from '@/components/ThemePicker'
import FeatureGrid from '@/components/FeatureGrid'
import { useTheme } from '@/hooks/useTheme'

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (u) => { setUser(u); setAuthLoaded(true) })
  }, [])

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
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--burgundy)', fontStyle: 'italic' }}>Notational</div>
            <div style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>Carnatic Music Notation System</div>
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/library" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>Library</a>
          <a href="/tutorial" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>Tutorial</a>
          <a href="/about" style={{ color: 'var(--ink-faint)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-ui)', fontStyle: 'italic' }}>About</a>
          <ThemePicker theme={theme} onThemeChange={setTheme} compact />
          {authLoaded && (
            user ? (
              <a href="/dashboard" className="btn btn-gold" style={{ fontSize: 12, padding: '6px 14px', textDecoration: 'none' }}>Go to Dashboard</a>
            ) : (
              <button className="btn btn-gold" onClick={() => setShowAuth(true)}>☁ Sign In</button>
            )
          )}
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px 96px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: 'var(--gold)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)', marginBottom: 16 }}>
            Carnatic music notation, digitized
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--burgundy)', fontStyle: 'italic', lineHeight: 1.2, marginBottom: 20 }}>
            Notational
          </h1>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--ink)', lineHeight: 1.7, maxWidth: 640, margin: '0 auto 32px' }}>
            A digital manuscript system for Carnatic music — built to feel like the paper
            notation musicians have relied on for generations, with the full 35-tala system,
            section headings, and cloud storage built in.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/compose/new" className="btn btn-primary" style={{ fontSize: 15, padding: '10px 24px' }}>Start Notating</a>
            <a href="/library" className="btn btn-secondary" style={{ fontSize: 15, padding: '10px 24px' }}>Browse the Library</a>
          </div>
        </div>

        {/* Decorative rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
          <span style={{ color: 'var(--gold)', fontSize: 18 }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gold)', opacity: 0.4 }} />
        </div>

        {/* Feature highlights */}
        <FeatureGrid />

        {/* Closing CTA */}
        <div style={{ borderTop: '1px solid rgba(201,151,58,0.3)', margin: '48px 0 0', paddingTop: 40, textAlign: 'center' }}>
          <a href="/compose/new" className="btn btn-primary" style={{ marginRight: 12 }}>Start Notating</a>
          {user ? (
            <a href="/dashboard" className="btn btn-secondary">View Dashboard</a>
          ) : (
            <button className="btn btn-secondary" onClick={() => setShowAuth(true)}>Sign In</button>
          )}
          <p style={{ marginTop: 20, color: 'var(--ink-faint)', fontSize: 12, fontStyle: 'italic' }}>
            Want to know more about the project? <a href="/about" style={{ color: 'var(--gold)' }}>Read the story behind Notational →</a>
          </p>
        </div>
      </main>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  )
}
