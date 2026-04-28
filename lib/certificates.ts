import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { ReadinessResult } from './readiness'

export interface CertificateData {
  certId:      string
  uid:         string
  displayName: string
  readiness:   ReadinessResult
  issuedAt:    number   // unix ms
}

export function makeCertId(uid: string): string {
  return `QRC-${uid.slice(0, 4).toUpperCase()}-${uid.slice(4, 8).toUpperCase()}`
}

export async function saveCertificate(data: Omit<CertificateData, 'issuedAt'>): Promise<void> {
  const ref  = doc(db, 'certificates', data.certId)
  const snap = await getDoc(ref)
  if (snap.exists()) return  // idempotent — never overwrite
  await setDoc(ref, { ...data, issuedAt: Date.now() })
}
