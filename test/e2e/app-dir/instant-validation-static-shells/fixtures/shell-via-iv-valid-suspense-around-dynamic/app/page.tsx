export const unstable_instant = { prefetch: 'static' as const }

export default function Page() {
  return (
    <main>
      <p>Static page with Suspense around dynamic content in layout.</p>
    </main>
  )
}
