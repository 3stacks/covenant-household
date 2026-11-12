'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'

import { churchDay } from '@daily-prayer/core/churchYear'

const noSubscribe = () => () => {}

/** A link to the readings of today. The page is static, so the browser finds today. */
export function TodayLink() {
  const id = useSyncExternalStore(noSubscribe, () => churchDay(new Date()).id, () => '')
  if (!id) return <p className="mt-6 h-8" />
  const today = churchDay(new Date())
  return (
    <p className="mt-6">
      <Link href={`/readings/${today.id}/`} className="text-base font-medium text-brand-600 hover:text-brand-800">
        Today: {today.name} <span aria-hidden="true">&rarr;</span>
      </Link>
    </p>
  )
}
