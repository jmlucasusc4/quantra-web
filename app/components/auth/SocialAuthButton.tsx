'use client'
// components/auth/SocialAuthButton.tsx
// Unified social sign-in button — supports Google, GitHub, Microsoft, Twitter

import { useState } from 'react'
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

type Provider = 'google' | 'github' | 'microsoft' | 'twitter'

interface Props {
  provider: Provider
  mode?: 'signin' | 'signup'
}

const CONFIG: Record<Provider, { label: string; icon: React.ReactNode }> = {
  google: {
    label: 'Google',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.71C4.672 4.584 6.656 3.58 9 3.58z"/>
      </svg>
    ),
  },
  github: {
    label: 'GitHub',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#e2d9f3">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  microsoft: {
    label: 'Microsoft',
    icon: (
      <svg width="18" height="18" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
      </svg>
    ),
  },
  twitter: {
    label: 'X (Twitter)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#e2d9f3">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
}

function getProvider(provider: Provider) {
  switch (provider) {
    case 'google': {
      const p = new GoogleAuthProvider()
      p.setCustomParameters({ prompt: 'select_account' })
      return p
    }
    case 'github':
      return new GithubAuthProvider()
    case 'microsoft':
      return new OAuthProvider('microsoft.com')
    case 'twitter':
      return new TwitterAuthProvider()
  }
}

export function SocialAuthButton({ provider, mode = 'signin' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { label, icon } = CONFIG[provider]

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const result = await signInWithPopup(auth, getProvider(provider))
      const user = result.user

      // Create Firestore user doc on first sign-in (idempotent)
      const userRef = doc(db, 'users', user.uid)
      const existing = await getDoc(userRef)
      if (!existing.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          tier: 'free',
          completedDemos: [],
          totalSimsRun: 0,
          totalKeysGenerated: 0,
          readinessScore: 0,
          readinessBreakdown: {
            algorithmsScore: 0,
            cryptoScore: 0,
            riskScore: 0,
            pqcScore: 0,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }

      router.push('/dashboard')
    } catch (err: any) {
      if (err?.code === 'auth/cancelled-popup-request' || err?.code === 'auth/popup-closed-by-user') {
        return; // user dismissed the popup — not an error
      }
      setError(`${label} sign-in failed. Please try again.`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '10px 16px',
          background: 'rgba(5, 7, 10, 0.72)',
          border: '0.5px solid rgba(255,255,255,0.09)',
          borderRadius: 8,
          color: 'rgba(200,195,220,0.7)',
          fontSize: 13,
          fontWeight: 450,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 0.62,
          transition: 'opacity 0.18s ease, border-color 0.18s ease, color 0.18s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity    = '1'
          e.currentTarget.style.color      = 'rgba(230,225,245,1)'
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity    = '0.62'
          e.currentTarget.style.color      = 'rgba(200,195,220,0.7)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
        }}
      >
        {icon}
        {loading
          ? 'Signing in...'
          : mode === 'signup'
            ? `Sign up with ${label}`
            : `Continue with ${label}`}
      </button>
      {error && (
        <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>{error}</p>
      )}
    </div>
  )
}
