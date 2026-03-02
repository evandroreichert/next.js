export const unstable_instant = { prefetch: 'static' as const }

export default function Page() {
  return (
    <main>
      <p>Static page under Suspense above body.</p>
    </main>
  )
}
