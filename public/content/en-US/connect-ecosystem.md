# Connect OpenClaw, Hermes & PicoClaw

HarnessSphere was designed to fit the real tools people run on a Claw/Harness host. This guide explains how the AI-side components connect to HarnessSphere, why they **push** their telemetry instead of being scraped, and how to build the receiver that takes it in.

## Why these components push (instead of being watched)

For the host and the watcher itself, HarnessSphere **pulls** — it reaches out and reads the OS natively. But the interesting AI data lives somewhere a passive watcher can't reach: it is *internal to the app*. A watcher standing outside the process can't see tokens consumed, search-index hits, or the shape of an AI transaction.

So the components do the opposite: they **push OTLP** to a local receiver that HarnessSphere runs — the **ingest plane** (Cargo feature `ingest`). When a signal arrives there, HarnessSphere:

- converts each incoming metric to its **canonical signal model**,
- **preserves the origin identity** (`service.name`, `gen_ai.provider`/`gen_ai.model` from the OTLP Resource),
- **enriches it with host context** (`host.name`, container id),
- **normalizes** differing conventions into clean `gen_ai.*`,
- and forwards **one tidy stream** onward through the same pipeline as the pulled signals.

Because both the pushed and pulled paths converge on one model and one pipeline, AI telemetry and host telemetry end up correlated — same host, same timeline.

## The components

### OpenClaw

OpenClaw **pushes OTLP** and also exposes a Prometheus endpoint at `/api/diagnostics/prometheus`. It emits both standard `gen_ai.*` metrics and its own `openclaw.*` keys (for example, `openclaw.tool.execution.*`).

Because that Prometheus endpoint exists, HarnessSphere can **also scrape it** — the same endpoint it uses to read the gateway. The `openclaw.*` Prometheus metrics can be picked up that way too.

### Hermes Agent

Hermes Agent pushes **nested OTLP spans** for sessions, LLM calls, and tools, via `hermes-otel`. Tool calls arrive as `tool.{name}` spans, nested under their parent AI span — so the session structure stays intact when it lands in HarnessSphere.

### PicoClaw

PicoClaw is the ultra-light option — perfect for the Raspberry Pi targets HarnessSphere itself runs on.

## What works today vs. what's on the roadmap

The **ingest plane is verified end-to-end today**: one HarnessSphere instance pushing OTLP into another, with the signals arriving on the far side already enriched with `host.name`. The local OTLP receiver today speaks **gRPC on `:4317`**.

Several enrichment and normalization steps are designed and on the roadmap:

| Capability | Status |
|---|---|
| Local OTLP receiver over gRPC (`:4317`) | Working today |
| Incoming metrics converted to the canonical model | Working today |
| Enrichment with `host.name` | Working today |
| Convention normalization (e.g. Hermes `llm.token_count.*` → `gen_ai.*`) | Roadmap |
| `container.id` enrichment | Roadmap |
| Content redaction | Roadmap |
| HTTP receiver (`:4318`) | Roadmap |

## Build the receiver

The ingest plane lives behind a Cargo feature. Build the binary with it enabled:

```bash
cargo build --release --features ingest
```

The `ingest` feature can be combined with the `otlp` export feature, so the same binary can receive pushed OTLP *and* forward everything on to your backend over OTLP. Enable both feature flags at build time:

- `ingest` — the local OTLP receiver (the push target).
- `otlp` — the OTLP exporter that ships the enriched stream to your backend.

Once built, point your components at the local gRPC receiver on `:4317` and they'll begin pushing.

## Next steps

- [Send to an OTLP Backend](/docs/otlp-backend) — forward the enriched stream from the ingest plane on to a real observability backend.
- [Troubleshooting](/docs/troubleshooting) — what to check when signals aren't arriving or aren't enriched as expected.
