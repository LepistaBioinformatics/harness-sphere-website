import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RootLayout } from './components/layout/root-layout'
import Landing from './routes/landing'

// Docs routes are loaded on demand — the markdown renderer and its plugins
// only ship when a reader actually opens the documentation.
const DocsIndex = lazy(() => import('./routes/docs-index'))
const DocPage = lazy(() => import('./routes/doc-page'))

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Landing />} />
        <Route
          path="docs"
          element={
            <Suspense fallback={null}>
              <DocsIndex />
            </Suspense>
          }
        />
        <Route
          path="docs/:slug"
          element={
            <Suspense fallback={null}>
              <DocPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Landing />} />
      </Route>
    </Routes>
  )
}
