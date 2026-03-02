import { Suspense } from 'react'

export default function RootLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <html>
        <body>{children}</body>
      </html>
    </Suspense>
  )
}
