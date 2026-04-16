'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  collection, query, orderBy, limit,
  onSnapshot, addDoc
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export type ActivityType =
  | 'demo_completed'
  | 'sim_run'
  | 'key_generated'
  | 'risk_audit'
  | 'upgrade'

export interface Activity {
  id: string
  type: ActivityType
  demoSlug?: string
  demoName?: string
  metadata?: Record<string, any>
  createdAt: number
}

interface ActivityState {
  activities: Activity[]
  loading: boolean
  logActivity: (event: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>
  logSimRun: (demoSlug: string, demoName: string, metadata?: Record<string, any>) => Promise<void>
  logKeyGenerated: (bits: number, format: string) => Promise<void>
  logRiskAudit: (algo: string, riskScore: number) => Promise<void>
}

export function useActivity(feedLimit = 20): ActivityState {
  const [user] = useAuthState(auth)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    const q = query(
      collection(db, 'users', user.uid, 'activity'),
      orderBy('createdAt', 'desc'),
      limit(feedLimit)
    )

    const unsub = onSnapshot(q, (snap) => {
      setActivities(
        snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity))
      )
      setLoading(false)
    })

    return () => unsub()
  }, [user, feedLimit])

  const logActivity = useCallback(async (event: Omit<Activity, 'id' | 'createdAt'>) => {
    if (!user) return
    await addDoc(collection(db, 'users', user.uid, 'activity'), {
      ...event,
      createdAt: Date.now(),
    })
  }, [user])

  const logSimRun = useCallback(async (
    demoSlug: string,
    demoName: string,
    metadata?: Record<string, any>
  ) => {
    await logActivity({ type: 'sim_run', demoSlug, demoName, metadata })
  }, [logActivity])

  const logKeyGenerated = useCallback(async (bits: number, format: string) => {
    await logActivity({
      type: 'key_generated',
      metadata: { bits, format },
    })
  }, [logActivity])

  const logRiskAudit = useCallback(async (algo: string, riskScore: number) => {
    await logActivity({
      type: 'risk_audit',
      metadata: { algo, riskScore },
    })
  }, [logActivity])

  return { activities, loading, logActivity, logSimRun, logKeyGenerated, logRiskAudit }
}

// Helper: human-readable activity description for the feed UI
export function activityLabel(a: Activity): string {
  switch (a.type) {
    case 'demo_completed':
      return `Completed ${a.demoName ?? a.demoSlug}`
    case 'sim_run':
      return `Ran simulation: ${a.demoName ?? a.demoSlug}${a.metadata?.shots ? ` (${a.metadata.shots} shots)` : ''}`
    case 'key_generated':
      return `Generated ${a.metadata?.bits ?? '?'}-bit QRNG key (${a.metadata?.format ?? 'hex'})`
    case 'risk_audit':
      return `Risk audit: ${a.metadata?.algo} scored ${a.metadata?.riskScore}% risk`
    case 'upgrade':
      return `Upgraded to ${a.metadata?.tier} plan`
    default:
      return 'Activity recorded'
  }
}

// Helper: relative time string ("2h ago", "Yesterday")
export function relativeTime(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}
