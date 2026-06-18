# Understanding the Layers

HarnessSphere is a single, self-contained binary that watches a machine running the
Claw/Harness AI ecosystem and turns everything it sees into clean, standard
**OpenTelemetry** signals. To do that, it models the host as **seven layers** — and
understanding those layers is the key to understanding what HarnessSphere actually
watches.

This page explains the seven-layer model, what each layer reports, how the data is
collected, and which layers ship today versus which are on the roadmap.

---

## The seven-layer model

Running an AI agent in production really means running several systems stacked on top of
each other: the hardware, the container, the gateway routing model traffic, the AI harness
itself, the tools it runs, and the API calls flowing in and out. HarnessSphere treats each
of these as an **isolated module** — one layer, one responsibility.

The seven layers are:

| Layer | Criticality | What it covers |
|---|---|---|
| Host | **Critical** | The physical or virtual machine underneath everything |
| The Watcher (Self) | **Critical** | HarnessSphere observing its own footprint and health |
| Container | Optional | cgroup v2 limits and usage when running in a container |
| Gateway | Optional | The control plane routing the harness's model traffic |
| Harness (the AI) | Optional | Tokens, AI operations, memory store, search index |
| Tools | Optional | Every tool the AI invokes, timed and counted |
| API Calls | Optional | HTTP and gRPC traffic flowing in and out |

### Critical vs. Optional

The distinction between **Critical** and **Optional** layers is the heart of how
HarnessSphere behaves:

- **Critical layers — Host and Self only.** The watcher refuses to run blind without them.
  If a Critical layer fails *persistently* (past a configurable threshold — a single
  transient hiccup is forgiven), the watcher flushes what it can and exits loudly with a
  non-zero code.
- **Optional layers — everything else.** If they're missing or misbehaving, they quietly
  step aside. A missing container or an unreachable gateway is treated as
  `Unavailable`/`NotApplicable`, not a crash. Optional layers degrade, back off, retry, and
  **never** bring the process down.

In other words: HarnessSphere will not pretend to monitor a machine it can't actually
read, but it will happily keep running even when the AI-specific layers aren't there yet.

---

## The layers, one by one

> **Legend** — `M` Metric · `L` Log · `T` Trace/Span. Instruments: **G**auge,
> **C**ounter, **UDC** UpDownCounter, **H**istogram.
> Status: ✅ shipping today · 🟡 designed & specified (on the roadmap).
> Keys prefixed with `harnesssphere.*` are HarnessSphere's own namespace, used where no
> official OpenTelemetry semantic convention exists yet.

### 🖥️ Host — *Critical*

The physical (or virtual) machine underneath everything. If HarnessSphere can't read the
host, there's no point pretending to monitor anything — so this layer is mandatory.

It reports CPU utilization, memory usage (broken down into used / free / available) and
overall memory utilization, plus swap (paging) usage and utilization. On the roadmap it
adds cumulative CPU time per state, disk throughput and busy time, filesystem space per
mount point, network I/O, packet counts/drops/errors, open connection counts, and
structured host health events (disk nearly full, OOM imminent). The host is
non-transactional, so it has no spans.

| Signal | Key | What it tells you | Status |
|---|---|---|---|
| M | `system.cpu.utilization` | Fraction of CPU currently in use | ✅ |
| M | `system.memory.usage` | Bytes of RAM by state — used / free / available | ✅ |
| M | `system.memory.utilization` | Fraction of RAM in use | ✅ |
| M | `system.paging.usage` / `system.paging.utilization` | Swap used and fraction in use | ✅ |
| M | `system.cpu.time` | Cumulative CPU time per state | 🟡 |
| M | `system.disk.*`, `system.filesystem.*`, `system.network.*` | Disk, filesystem and network activity | 🟡 |
| L | host health events | Disk nearly full, OOM imminent, etc. | 🟡 |

### 🛰️ The Watcher (Self) — *Critical*

HarnessSphere watches its own back. A monitoring tool you can't see is a liability, so it
reports its own footprint and how healthy its collection loop is. Also mandatory.

It reports the watcher's own CPU utilization and memory (resident RSS and virtual). On the
roadmap it adds thread and open-file-descriptor counts, scrape and full-collection-cycle
durations, scrape counts by outcome (`success` / `error` / `panic`), per-collector health
state (`0` ready · `1` degraded · `2` unavailable), signals dropped under backpressure,
logs of scrape failures and state transitions, and a trace span per collection cycle with
a child span per collector.

| Signal | Key | What it tells you | Status |
|---|---|---|---|
| M | `process.cpu.utilization` | CPU the watcher itself is using | ✅ |
| M | `process.memory.usage` | Watcher's resident memory (RSS) | ✅ |
| M | `process.memory.virtual` | Watcher's virtual memory | ✅ |
| M | `harnesssphere.collector.state` | Per-collector health: ready / degraded / unavailable | 🟡 |
| M | `harnesssphere.export.items.dropped` | Signals dropped under backpressure | 🟡 |
| T | `harnesssphere.collection.cycle` | One span per cycle, child span per collector | 🟡 |

### 📦 Container — *Optional*

If the harness runs inside a container, HarnessSphere reads its **cgroup v2** stats
directly from the kernel — no Docker socket, no runtime API, no extra permissions.

It reports container CPU consumption, memory in use, the container's memory ceiling, OOM /
throttle events, CPU throttling, and disk I/O, plus a log that warns when the container
vanishes from the cgroup. Like the host, cgroup metrics are non-transactional, so there
are no spans.

| Signal | Key | What it tells you | Status |
|---|---|---|---|
| M | `container.cpu.time` / `container.cpu.usage` | CPU consumed by the container | 🟡 |
| M | `container.memory.usage` | Container memory in use | 🟡 |
| M | `harnesssphere.container.memory.limit` | The container's memory ceiling | 🟡 |
| M | `harnesssphere.container.memory.throttled` / `…cpu.throttled` | OOM/throttle and CPU throttling events | 🟡 |
| L | container lifecycle | Warns when the container vanishes | 🟡 |

### 🚪 Gateway — *Optional*

The control plane that routes the harness's model traffic. HarnessSphere measures route
latency and connection health — by scraping the gateway's Prometheus endpoint and/or by
receiving what it pushes over OTLP.

It reports per-route request latency (tagged with method, route and status code), requests
in flight, whether the gateway/route is reachable, active connections by state, and the
latency of the watcher's own health probe. It logs dropped connections and upstream 5xx
failures, and forwards the propagated `traceparent` so AI traces stay connected.

| Signal | Key | What it tells you | Status |
|---|---|---|---|
| M | `http.server.request.duration` | Per-route latency by method, route, status | 🟡 |
| M | `http.server.active_requests` | Requests in flight | 🟡 |
| M | `harnesssphere.gateway.up` | Is the gateway/route reachable? | 🟡 |
| M | `harnesssphere.gateway.probe.latency` | Latency of the watcher's own health probe | 🟡 |
| T | trace passthrough | Propagated `traceparent` forwarded to keep AI traces connected | 🟡 |

### 🧠 Harness (the AI) — *Optional* · the star of the show

This is what makes HarnessSphere special. It follows the official **GenAI semantic
conventions** (`gen_ai.*`), so token counts, request durations and AI transactions land in
your backend in a standard, vendor-neutral shape.

It reports tokens consumed (split by `input` / `output`, model and provider), end-to-end
AI operation latency, message counts by role, cache-read and cache-creation tokens, the
size of the harness's memory store, and search-index queries and hit ratio. It logs model
errors, refusals and cutoffs, and emits one span per AI transaction (e.g. `chat
gpt-4o-mini`) plus agent/turn structure when the harness exposes it.

| Signal | Key | What it tells you | Status |
|---|---|---|---|
| M | `gen_ai.client.token.usage` | Tokens by input/output, model and provider | 🟡 |
| M | `gen_ai.client.operation.duration` | End-to-end latency of each AI operation | 🟡 |
| M | `harnesssphere.harness.messages` | Message counts by role | 🟡 |
| M | `harnesssphere.harness.search_index.hit_ratio` | Search-index hit ratio | 🟡 |
| L | model errors / refusals / cutoffs | Finish reasons and error types | 🟡 |
| T | `{operation} {model}` | One span per AI transaction | 🟡 |

### 🔧 Tools — *Optional*

Every tool the AI invokes, timed and counted, following the GenAI `execute_tool` span
convention.

It reports how long each tool takes (by name and outcome) and the call count per tool, logs
tool execution errors (name, error type and message), and emits an `execute_tool` span per
call, nested under its parent AI span.

| Signal | Key | What it tells you | Status |
|---|---|---|---|
| M | `harnesssphere.tool.execution.duration` | How long each tool takes, by name and outcome | 🟡 |
| M | `harnesssphere.tool.calls` | Call count per tool | 🟡 |
| L | tool execution errors | Tool name, error type and message | 🟡 |
| T | `execute_tool {tool_name}` | A span per tool call, nested under its parent AI span | 🟡 |

### 🌐 API Calls — *Optional*

The HTTP and gRPC traffic flowing in and out, using the standard `http.*` and `rpc.*`
conventions.

It reports inbound/outbound request latency (with method, route and status), payload
sizes, gRPC latency (with service, method and status code), and request counts by direction
and status class (2xx/4xx/5xx). It logs 4xx/5xx responses and emits HTTP/gRPC client and
server spans, correlated with the AI traces above.

| Signal | Key | What it tells you | Status |
|---|---|---|---|
| M | `http.client.request.duration` / `http.server.request.duration` | Outbound/inbound request latency | 🟡 |
| M | `rpc.client.duration` / `rpc.server.duration` | gRPC latency by service, method, status | 🟡 |
| M | `harnesssphere.api.requests` | Request counts by direction and status class | 🟡 |
| L | 4xx / 5xx responses | Method, route, status and latency | 🟡 |
| T | client/server spans | HTTP/gRPC spans correlated with the AI traces | 🟡 |

> Every signal also carries a global **Resource** so you always know *where* it came from:
> `service.name=harnesssphere`, `service.version`, plus `host.name`, `host.id`, `host.arch`
> and `os.type`.

---

## How signals are collected: Pull vs. Receive

HarnessSphere gathers data two ways.

- **Pull** — it reaches out and reads or scrapes a target. The host and self layers are
  pulled from the `sysinfo` crate (which reads the OS natively); the container layer is
  pulled by reading cgroup v2 files directly; the gateway is pulled by scraping its
  Prometheus endpoint plus an active health probe.
- **Receive / Push** — it lets a target push data to it over **OTLP ingest**. The harness,
  tools and API-call layers are *internal to the app* — a passive watcher can't see tokens
  or search-index hits — so components like OpenClaw and Hermes **push OTLP** to
  HarnessSphere's local receiver.

| Layer | Mechanism | Status |
|---|---|---|
| Host | Pull — `sysinfo` crate | ✅ |
| Watcher (Self) | Pull — `sysinfo` process API | ✅ |
| Container | Pull — cgroup v2, read directly | 🟡 |
| Gateway | Pull — Prometheus scrape + active probe | 🟡 |
| Harness (AI) | Push — OTLP ingest (+ Prometheus) | 🟡 ingest ✅ |
| Tools | Push — OTLP ingest | 🟡 |
| API Calls | Push — OTLP ingest (+ scrape) | 🟡 |

### One canonical pipeline

The important part is what happens *after* collection. A **pulled** signal is read by a
collector, turned into a canonical `Metric` / `Log` / `Span`, and dropped onto an internal
channel. A **pushed** signal arrives at the OTLP receiver, is converted from OTLP into that
same canonical shape, **enriched with host context** (such as `host.name`) while preserving
its origin identity, and dropped onto the same channel.

From there a single batching drain hands everything to the active exporter. Because both
paths converge on **one model and one pipeline**, AI telemetry and host telemetry end up
**correlated** — same host, same timeline, same trace. That correlation is exactly what
lets you tie an AI slowdown to the resource pressure that caused it.

---

## Privacy by default

Prompt and completion **content** is **never** captured unless you explicitly opt in, per
layer. By default you get counts, durations and status — not text. Privacy is the default,
not an afterthought.

---

## What ships today

HarnessSphere is under active development, and the layers reflect that:

- **Host** and **Self** ship today (✅) — they're the Critical layers, so they had to come
  first.
- **Most other layers are on the roadmap** (🟡): container, gateway, harness, tools and API
  calls are designed and specified, with the harness ingest plane already verified
  end-to-end for metrics.

---

## Next steps

- See [`/docs/configuration`](/docs/configuration) to tune collection intervals, the
  Critical failure threshold, and per-layer opt-in.
- See [`/docs/otlp-backend`](/docs/otlp-backend) to point HarnessSphere at your
  OpenTelemetry backend over OTLP.
