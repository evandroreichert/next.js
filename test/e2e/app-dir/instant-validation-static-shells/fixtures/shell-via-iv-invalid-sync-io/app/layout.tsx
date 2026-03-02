import { SyncIOClient } from './client'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SyncIOClient />
        {children}
      </body>
    </html>
  )
}
