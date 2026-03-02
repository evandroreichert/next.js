export const unstable_instant = { prefetch: 'static' as const }

export default function Page() {
  return (
    <main>
      <p>Page with sync IO in parent client component.</p>
    </main>
  )
}
