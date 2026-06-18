# harness-sphere-website

Presentation site and user manuals for **[HarnessSphere](https://github.com/LepistaBioinformatics/harness-sphere)** —
the unified OpenTelemetry watcher for the Claw/Harness AI ecosystem.

A high-impact landing page plus configuration & usage manuals for beginner/intermediate
users. Docs are authored in Markdown, rendered on demand with `react-markdown`, available
in **pt-BR** and **en-US** (en-US fallback), and downloadable as raw `.md` for bots and
offline reading.

Design follows the [lepista.com.br](https://lepista.com.br) brand: dark-first, deep
purple canvas with category accent colours.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · class-variance-authority · react-i18next ·
react-router-dom · react-markdown (+ remark-gfm, rehype-slug/-autolink/-highlight) ·
lucide-react · self-hosted fonts (Sora / IBM Plex Sans / JetBrains Mono).

## Develop

```bash
yarn install
yarn dev        # http://localhost:5173
yarn build      # type-check + production build to dist/
yarn preview    # serve the production build
```

## Internationalization

- UI chrome strings live in `src/i18n/locales/{en-US,pt-BR}/common.json`.
- `en-US` is the fallback locale; the language is detected from `localStorage` →
  browser, and the switcher in the nav flips it live.
- Long-form manual prose lives in Markdown files (see below), not in the i18n JSON.

## Content (manuals)

Markdown is **served as static assets and fetched at runtime** — never bundled. That single
decision is what makes docs lazy-loaded, language-aware, and downloadable as raw `.md`:

```
public/content/
├── manifest.json          # source of truth: slug, category, titles, available locales
├── en-US/<slug>.md        # raw markdown — also the download / bot URL
└── pt-BR/<slug>.md
```

- **On demand:** the docs routes and the markdown renderer are a lazy chunk; each `.md` is
  fetched only when its page is opened.
- **Fallback:** `useMarkdown` loads the active locale if the manifest lists it, otherwise
  falls back to `en-US` (with a defensive retry if a file is missing).
- **Downloadable / crawlable:** every doc has a clean static URL, e.g.
  `GET /content/en-US/configuration.md` returns the raw Markdown. The “Download .md” button
  links straight to it.

### Add or edit a manual

1. Add/replace `public/content/en-US/<slug>.md` (authoritative) and, ideally,
   `public/content/pt-BR/<slug>.md`. Start each file with a single `# H1`; no YAML
   frontmatter.
2. Register it in `public/content/manifest.json` (slug, category, order, per-locale title,
   and the `locales` it exists in).

## Deployment

The build is deployment-agnostic. Set a base path for subpath hosting (e.g. GitHub Pages):

```bash
VITE_BASE=/harness-sphere-website/ yarn build
```

`base` defaults to `/`. The router reads it via `import.meta.env.BASE_URL`.

## License

MIT OR Apache-2.0, matching HarnessSphere.
