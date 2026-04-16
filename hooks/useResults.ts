'use client'

import { useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface DemoStat {
  label: string
  value: string
}

export interface DemoResult {
  demoSlug: string
  demoName: string
  tier: 'free' | 'pro' | 'research'
  completedAt: number
  stats: DemoStat[]
  shareText: string
}

interface ResultsState {
  saveResult: (result: Omit<DemoResult, 'completedAt' | 'shareText'>) => Promise<DemoResult>
  getResult: (demoSlug: string) => Promise<DemoResult | null>
  buildShareText: (result: DemoResult) => string
}

function buildShareText(result: DemoResult): string {
  const statsLine = result.stats.map(s => `${s.label}: ${s.value}`).join(' · ')
  return `Just ran ${result.demoName} on Quantra — a quantum computing & cybersecurity simulator.\n\n${statsLine}\n\nquantra.space #QuantumSecurity #PostQuantum #Cybersecurity`
}

export function useResults(): ResultsState {
  const [user] = useAuthState(auth)

  const saveResult = useCallback(async (
    result: Omit<DemoResult, 'completedAt' | 'shareText'>
  ): Promise<DemoResult> => {
    const full: DemoResult = {
      ...result,
      completedAt: Date.now(),
      shareText: buildShareText({ ...result, completedAt: Date.now(), shareText: '' }),
    }

    if (user) {
      await setDoc(
        doc(db, 'users', user.uid, 'results', result.demoSlug),
        full,
        { merge: true }
      )
    }

    return full
  }, [user])

  const getResult = useCallback(async (demoSlug: string): Promise<DemoResult | null> => {
    if (!user) return null
    const snap = await getDoc(doc(db, 'users', user.uid, 'results', demoSlug))
    return snap.exists() ? (snap.data() as DemoResult) : null
  }, [user])

  return { saveResult, getResult, buildShareText }
}
