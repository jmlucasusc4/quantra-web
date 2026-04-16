// components/auth/GoogleAuthButton.tsx
'use client'

import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export function GoogleAuthButton({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Create Firestore user doc if first time (idempotent)
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
      setError('Google sign-in failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '11px 16px',
          background: 'transparent',
          border: '1px solid #2a2450',
          borderRadius: 9,
          color: '#e2d9f3',
          fontSize: 14,
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'border-color .2s, background .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#7c3aed')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2450')}
      >
        {/* Google SVG icon */}
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.71C4.672 4.584 6.656 3.58 9 3.58z"/>
        </svg>
        {loading ? 'Signing in...' : mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
      </button>
      {error && (
        <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center' }}>{error}</p>
      )}
    </div>
  )
}
