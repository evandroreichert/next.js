import type { Viewport } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { connection } from 'next/server'

export const unstable_instant = { prefetch: 'static' as const }

export async function generateViewport(): Promise<Viewport> {
  await cookies()
  return { themeColor: 'aliceblue' }
}

async function DynamicContent() {
  await connection()
  return <p>Dynamic content</p>
}

export default function Page() {
  return (
    <main>
      <p>Page with dynamic viewport.</p>
      <Suspense fallback={<p>Loading...</p>}>
        <DynamicContent />
      </Suspense>
    </main>
  )
}
