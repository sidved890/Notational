'use client'

import { useState } from 'react'
import {
  getFirebaseAuth,
  getFirebaseApp,
} from '@/lib/firebase'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      const auth = getFirebaseAuth()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const auth = getFirebaseAuth()
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,18,8,0.6)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          padding: '32px 36px',
          maxWidth: 420,
          width: '90%',
          boxShadow: '0 8px 40px rgba(42,26,14,0.35)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
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

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--burgundy)',
            marginBottom: 8,
            fontStyle: 'italic',
          }}
        >
          Sign in to Notational
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'var(--ink-light)',
            marginBottom: 24,
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          Save your compositions to the cloud and access them anywhere.
        </p>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            background: 'white',
            border: '1.5px solid #ddd',
            color: '#333',
            padding: '8px 16px',
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'box-shadow 0.15s',
            fontFamily: 'var(--font-ui)',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }}>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div
          style={{
            textAlign: 'center',
            color: 'var(--ink-faint)',
            fontSize: 12,
            margin: '16px 0',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'var(--parchment)',
              padding: '0 8px',
            }}
          >
            or
          </span>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              width: '100%',
              height: 1,
              background: 'rgba(201,151,58,0.3)',
              zIndex: 0,
            }}
          />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '9px 12px',
              background: 'var(--parchment-dark)',
              border: '1.5px solid rgba(107,30,46,0.25)',
              borderRadius: 4,
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--ink)',
              width: '100%',
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: '9px 12px',
              background: 'var(--parchment-dark)',
              border: '1.5px solid rgba(107,30,46,0.25)',
              borderRadius: 4,
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: 'var(--ink)',
              width: '100%',
              outline: 'none',
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: '#c0392b', fontStyle: 'italic' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Loading…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {/* Switch sign in / sign up */}
        <div
          style={{
            fontSize: 13,
            color: 'var(--ink-faint)',
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--burgundy)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}
