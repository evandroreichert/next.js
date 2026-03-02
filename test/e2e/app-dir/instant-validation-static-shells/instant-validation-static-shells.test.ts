import { nextTestSetup } from 'e2e-utils'
import { waitForNoErrorToast } from 'next-test-utils'
import { join } from 'node:path'

describe('instant validation - opting out of static shells', () => {
  const { next, skipped, isNextDev } = nextTestSetup({
    files: join(__dirname, 'fixtures', 'valid'),
    skipDeployment: true,
  })
  if (skipped) return

  // NOTE: if something's wrong in build, we'll fail before any tests run.
  // Visiting the pages is mostly just a sanity check.

  it('does not require a static shell if a root layouts is configured as blocking', async () => {
    const browser = await next.browser('/blocking-root-layout')
    await browser.elementByCss('main')
    if (isNextDev) await waitForNoErrorToast(browser)
  })
  it('does not require a static shell if a layout is configured as blocking', async () => {
    const browser = await next.browser('/blocking-layout')
    await browser.elementByCss('main')
    if (isNextDev) await waitForNoErrorToast(browser)
  })
  it('does not require a static shell if a page is configured as blocking', async () => {
    const browser = await next.browser('/blocking-page')
    await browser.elementByCss('main')
    if (isNextDev) await waitForNoErrorToast(browser)
  })
})

describe('instant validation', () => {
  describe('requires a static shell if a below a static layout page is configured as blocking', () => {
    const { next, skipped, isNextDev } = nextTestSetup({
      files: join(__dirname, 'fixtures', 'invalid-blocking-page-below-static'),
      skipStart: true,
      skipDeployment: true,
    })
    if (skipped) return

    if (isNextDev) {
      beforeAll(() => next.start())
      it('errors in dev', async () => {
        const browser = await next.browser('/blocking-page-below-static')
        await browser.elementByCss('main')
        await expect(browser).toDisplayCollapsedRedbox(`
         {
           "code": "E1084",
           "description": "Data that blocks navigation was accessed outside of <Suspense>

         This delays the entire page from rendering, resulting in a slow user experience. Next.js uses this error to ensure your app loads instantly on every navigation. Uncached data such as fetch(...), cached data with a low expire time, or connection() are all examples of data that only resolve on navigation.

         To fix this, you can either:

         Provide a fallback UI using <Suspense> around this component. This allows Next.js to stream its contents to the user as soon as it's ready, without blocking the rest of the app.

         or

         Move the asynchronous await into a Cache Component ("use cache"). This allows Next.js to statically prerender the component as part of the HTML document, so it's instantly visible to the user.

         Learn more: https://nextjs.org/docs/messages/blocking-route",
           "environmentLabel": "Server",
           "label": "Blocking Route",
           "source": "app/blocking-page-below-static/page.tsx (6:19) @ Page
         > 6 |   await connection()
             |                   ^",
           "stack": [
             "Page app/blocking-page-below-static/page.tsx (6:19)",
           ],
         }
        `)
      })
    } else {
      let didBuildError = false
      beforeAll(async () => {
        try {
          await next.start()
        } catch (err) {
          didBuildError = true
        }
      })
      it('errors during build', () => {
        expect(didBuildError).toBe(true)
        expect(next.cliOutput).toContain(
          'Uncached data was accessed outside of <Suspense>'
        )
      })
    }
  })
})

// Static shell validation via instant validation:
// When a route has instant config (needsInstantValidation === true),
// static shell validation runs through the instant validation infrastructure
// with navigationParent = null (entire tree is new).

describe('static shell validation via instant validation - valid scenarios', () => {
  describe('clean static shell with instant config', () => {
    const { next, skipped, isNextDev } = nextTestSetup({
      files: join(__dirname, 'fixtures', 'shell-via-iv-valid-clean'),
      skipDeployment: true,
    })
    if (skipped) return

    it('produces a valid static shell', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('main')
      if (isNextDev) await waitForNoErrorToast(browser)
    })
  })

  describe('Suspense above body with instant config', () => {
    const { next, skipped, isNextDev } = nextTestSetup({
      files: join(
        __dirname,
        'fixtures',
        'shell-via-iv-valid-suspense-above-body'
      ),
      skipDeployment: true,
    })
    if (skipped) return

    it('does not require a static shell when Suspense is above body', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('main')
      if (isNextDev) await waitForNoErrorToast(browser)
    })
  })

  describe('Suspense around dynamic content with instant config', () => {
    const { next, skipped, isNextDev } = nextTestSetup({
      files: join(
        __dirname,
        'fixtures',
        'shell-via-iv-valid-suspense-around-dynamic'
      ),
      skipDeployment: true,
    })
    if (skipped) return

    it('allows dynamic content wrapped in Suspense inside body', async () => {
      const browser = await next.browser('/')
      await browser.elementByCss('main')
      if (isNextDev) await waitForNoErrorToast(browser)
    })
  })
})

describe('static shell validation via instant validation - invalid scenarios', () => {
  describe('sync IO in client component', () => {
    const { next, skipped, isNextDev } = nextTestSetup({
      files: join(__dirname, 'fixtures', 'shell-via-iv-invalid-sync-io'),
      skipStart: true,
      skipDeployment: true,
    })
    if (skipped) return

    if (isNextDev) {
      beforeAll(() => next.start())
      it('detects sync IO in client component when entire tree is new', async () => {
        const browser = await next.browser('/')
        await expect(browser).toDisplayCollapsedRedbox(`
         {
           "description": "Route "/" used \`Date.now()\` inside a Client Component without a Suspense boundary above it. See more info here: https://nextjs.org/docs/messages/next-prerender-current-time-client",
           "environmentLabel": "Server",
           "label": "Console Error",
           "source": "app/client.tsx (4:20) @ SyncIOClient
         > 4 |   const now = Date.now()
             |                    ^",
           "stack": [
             "SyncIOClient app/client.tsx (4:20)",
             "RootLayout app/layout.tsx (7:9)",
           ],
         }
        `)
      })
    } else {
      let didBuildError = false
      beforeAll(async () => {
        try {
          await next.start()
        } catch (err) {
          didBuildError = true
        }
      })
      it.skip('errors during build', () => {
        expect(didBuildError).toBe(true)
        expect(next.cliOutput).toContain('Date.now()')
      })
    }
  })

  describe('dynamic generateViewport with instant config', () => {
    const { next, skipped, isNextDev } = nextTestSetup({
      files: join(
        __dirname,
        'fixtures',
        'shell-via-iv-invalid-dynamic-viewport'
      ),
      skipStart: true,
      skipDeployment: true,
    })
    if (skipped) return

    if (isNextDev) {
      beforeAll(() => next.start())
      it('detects dynamic viewport', async () => {
        const browser = await next.browser('/')
        await expect(browser).toDisplayCollapsedRedbox(`
         {
           "description": "Runtime data was accessed inside generateViewport()

         Viewport metadata needs to be available on page load so accessing data that comes from a user Request while producing it prevents Next.js from prerendering an initial UI.cookies(), headers(), and searchParams, are examples of Runtime data that can only come from a user request.

         To fix this:

         Remove the Runtime data requirement from generateViewport. This allows Next.js to statically prerender generateViewport() as part of the HTML document, so it's instantly visible to the user.

         or

         Put a <Suspense> around your document <body>.This indicate to Next.js that you are opting into allowing blocking navigations for any page.

         params are usually considered Runtime data but if all params are provided a value using generateStaticParams they can be statically prerendered.

         Learn more: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport",
           "environmentLabel": "Server",
           "label": "Blocking Route",
           "source": "app/page.tsx (8:23) @ Module.generateViewport
         >  8 | export async function generateViewport(): Promise<Viewport> {
              |                       ^",
           "stack": [
             "Module.generateViewport app/page.tsx (8:23)",
             "NoopContextManager.with ../../../node_modules/.pnpm/@opentelemetry+api@1.6.0/node_modules/@opentelemetry/api/src/context/NoopContextManager.ts (31:19)",
             "ContextAPI.with ../../../node_modules/.pnpm/@opentelemetry+api@1.6.0/node_modules/@opentelemetry/api/src/api/context.ts (77:42)",
             "NoopTracer.startActiveSpan ../../../node_modules/.pnpm/@opentelemetry+api@1.6.0/node_modules/@opentelemetry/api/src/trace/NoopTracer.ts (98:27)",
             "ProxyTracer.startActiveSpan ../../../node_modules/.pnpm/@opentelemetry+api@1.6.0/node_modules/@opentelemetry/api/src/trace/ProxyTracer.ts (51:20)",
             "NoopContextManager.with ../../../node_modules/.pnpm/@opentelemetry+api@1.6.0/node_modules/@opentelemetry/api/src/context/NoopContextManager.ts (31:19)",
             "ContextAPI.with ../../../node_modules/.pnpm/@opentelemetry+api@1.6.0/node_modules/@opentelemetry/api/src/api/context.ts (77:42)",
           ],
         }
        `)
      })
    } else {
      let didBuildError = false
      beforeAll(async () => {
        try {
          await next.start()
        } catch (err) {
          didBuildError = true
        }
      })
      it('errors during build', () => {
        expect(didBuildError).toBe(true)
        expect(next.cliOutput).toContain('generateViewport')
      })
    }
  })
})

describe('static shell validation - allowEmptyStaticShell early return', () => {
  describe('blocking root skips validation entirely', () => {
    const { next, skipped, isNextDev } = nextTestSetup({
      files: join(__dirname, 'fixtures', 'early-return-blocking-root'),
      skipDeployment: true,
    })
    if (skipped) return

    it('does not error when root is blocking even with sync IO and instant config child', async () => {
      const browser = await next.browser('/child')
      await browser.elementByCss('main')
      if (isNextDev) await waitForNoErrorToast(browser)
    })
  })
})
