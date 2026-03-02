import { connection } from 'next/server'

export default async function ChildPage() {
  await connection()
  return (
    <main>
      <p>Dynamic child page under blocking root.</p>
    </main>
  )
}
