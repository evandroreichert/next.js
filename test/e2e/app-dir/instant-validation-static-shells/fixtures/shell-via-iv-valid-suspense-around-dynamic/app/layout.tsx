import { Suspense } from 'react'
import { connection } from 'next/server'

async function DynamicHeader() {
  await connection()
  return <p>Dynamic header content</p>
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Suspense fallback={<p>Loading header...</p>}>
          <DynamicHeader />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
