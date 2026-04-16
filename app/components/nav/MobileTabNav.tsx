'use client'
// components/nav/MobileTabNav.tsx
// Shows on mobile only — bottom tab bar for demos, dashboard, pricing

import { useRouter, usePathname } from 'next/navigation'

const TABS = [
  { label: 'Demos',     icon: '⬡', href: '/' },
  { label: 'Dashboard', icon: '◎', href: '/dashboard' },
  { label: 'Progress',  icon: '◈', href: '/dashboard' },
  { label: 'Pricing',   icon: '✦', href: '/pricing' },
]

export function MobileTabNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="mobile-tab-nav">
      {TABS.map(tab => {
        const active = tab.href === '/'
          ? pathname === '/'
          : pathname?.startsWith(tab.href)
        return (
          <button
            key={tab.label}
            className={`mobile-tab-btn${active ? ' active' : ''}`}
            onClick={() => router.push(tab.href)}
          >
            <span className="mobile-tab-icon" style={{ fontSize: 18 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
