import { Suspense } from 'react'

export const unstable_instant = { prefetch: 'static' as const }

export default function ChildLayout({ children }) {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
    </div>
  )
}
