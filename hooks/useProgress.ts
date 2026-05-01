'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, updateDoc, setDoc, arrayUnion, arrayRemove, onSnapshot, increment } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { computeReadiness, ReadinessResult } from '@/lib/readiness'

interface ProgressState {
  completedDemos: string[]
  readiness: ReadinessResult
  loading: boolean
  markComplete: (slug: string, demoName: string) => Promise<void>
  markIncomplete: (slug: string) => Promise<void>
  isComplete: (slug: string) => boolean
}

const DEFAULT_READINESS: ReadinessResult = {
  total: 0,
  breakdown: { algorithmsScore: 0, cryptoScore: 0, riskScore: 0, pqcScore: 0 },
  level: 'novice',
  nextRecommended: 'superposition',
}

export function useProgress(): ProgressState {
  const [user] = useAuthState(auth)
  const [completedDemos, setCompletedDemos] = useState<string[]>([])
  const [readiness, setReadiness] = useState<ReadinessResult>(DEFAULT_READINESS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        const data = snap.data()
        const demos: string[] = data?.completedDemos ?? []
        setCompletedDemos(demos)
        setReadiness(computeReadiness(demos))
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )

    return () => unsub()
  }, [user])

  const markComplete = useCallback(async (slug: string, demoName: string) => {
    if (!user || completedDemos.includes(slug)) return

    const userRef = doc(db, 'users', user.uid)
    const newCompleted = [...completedDemos, slug]
    const newReadiness = computeReadiness(newCompleted)

    // Optimistic update
    setCompletedDemos(newCompleted)
    setReadiness(newReadiness)

    try {
      await updateDoc(userRef, {
        completedDemos: arrayUnion(slug),
        totalSimsRun: increment(1),
        readinessScore: newReadiness.total,
        readinessBreakdown: newReadiness.breakdown,
        updatedAt: Date.now(),
      })
    } catch {
      // Doc doesn't exist yet — bootstrap it (e.g. pre-fix signups or social auth edge cases)
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        tier: 'free',
        completedDemos: newCompleted,
        totalSimsRun: 1,
        totalKeysGenerated: 0,
        readinessScore: newReadiness.total,
        readinessBreakdown: newReadiness.breakdown,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    // Append to activity feed
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
    await addDoc(collection(db, 'users', user.uid, 'activity'), {
      type: 'demo_completed',
      demoSlug: slug,
      demoName,
      createdAt: Date.now(),
    })
  }, [user, completedDemos])

  const markIncomplete = useCallback(async (slug: string) => {
    if (!user) return

    const userRef = doc(db, 'users', user.uid)
    const newCompleted = completedDemos.filter(d => d !== slug)
    const newReadiness = computeReadiness(newCompleted)

    setCompletedDemos(newCompleted)
    setReadiness(newReadiness)

    await updateDoc(userRef, {
      completedDemos: arrayRemove(slug),
      readinessScore: newReadiness.total,
      readinessBreakdown: newReadiness.breakdown,
      updatedAt: Date.now(),
    })
  }, [user, completedDemos])

  const isComplete = useCallback(
    (slug: string) => completedDemos.includes(slug),
    [completedDemos]
  )

  return { completedDemos, readiness, loading, markComplete, markIncomplete, isComplete }
}
