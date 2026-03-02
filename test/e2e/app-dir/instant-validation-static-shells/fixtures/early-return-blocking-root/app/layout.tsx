import { connection } from 'next/server'
import { SyncIOClient } from './client'

export const unstable_instant = false

export default async function RootLayout({ children }) {
  await connection()
  return (
    <html>
      <body>
        <SyncIOClient />
        {children}
      </body>
    </html>
  )
}
