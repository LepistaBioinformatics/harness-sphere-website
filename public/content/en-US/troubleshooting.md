# Troubleshooting & FAQ

HarnessSphere is built to be quiet when things are fine and loud only when something genuinely demands your attention. Most of the surprises people hit aren't bugs — they're the resilience model doing exactly what it's designed to do. This page walks through the most common questions, what the behavior actually means, and what (if anything) you should do about it.

## Crashes and exit codes

### The watcher exited with a non-zero code

This is **by design**, and it only happens for one reason: a **Critical** collector failed *persistently*.

Only two layers are Critical — **Host** and **Self** (the watcher observing its own footprint). If one of them keeps failing past `critical_threshold` *consecutive* failures, HarnessSphere flushes what it can and exits loudly with a non-zero code. A watcher that can't read the host or can't see itself is blind, and a blind watcher is worse than no watcher — so it refuses to keep pretending.

A **single transient hiccup is forgiven**. The threshold counts *consecutive* failures; one bad scrape followed by a good one resets the count.

The default threshold is `3`:

```toml
critical_threshold = 3   # consecutive Critical failures before exiting (exit != 0)
```

If you want more tolerance for a flaky environment, raise it. If you want to fail fast, lower it. See [Configuration](/docs/configuration) for the full key reference.

### Everything except Host and Self can fail without taking the watcher down

Worth repeating, because it's the flip side of the rule above: the Optional collectors (container, gateway, harness, tools, API) **never** bring the process down. They degrade, back off, and retry. Only a persistently-failing Host or Self collector is fatal.

## "Missing" targets that aren't actually errors

### I have no container / no gateway responding

That's not a crash, and it's not even an error. A missing target reports as `Unavailable` / `NotApplicable`.

When there's no container to read, or no gateway answering, the relevant Optional collector simply **sits out and keeps probing**. It never brings the process down. If the target shows up later, the collector picks it back up. There's nothing to fix here.

### My OpenTelemetry backend is down

Collection keeps running. If your OpenTelemetry endpoint disappears, **export fails quietly in the background** while HarnessSphere continues collecting signals. A dead backend never blocks collection — when the backend comes back, export resumes.

## Nothing showing up in my backend

### I see nothing in my backend

If collection is running but nothing lands in your observability backend, check these in order:

1. **The exporter is set to `otlp`.** The default exporter is `stdout`, which prints to your terminal and sends nothing over the network. Set it explicitly:

   ```bash
   HARNESSSPHERE_EXPORTER=otlp \
     ./target/release/harnesssphere config.example.toml
   ```

   Note the OTLP adapter must be compiled in (`cargo build --release --features otlp`).

2. **`OTEL_EXPORTER_OTLP_ENDPOINT` points at a reachable gRPC collector.** It should target your collector's OTLP/gRPC port, conventionally `:4317`:

   ```bash
   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 \
   HARNESSSPHERE_EXPORTER=otlp \
     ./target/release/harnesssphere config.example.toml
   ```

3. **Remember only metrics ship over OTLP today.** Logs and traces are on the roadmap — if you're looking for spans or log lines in your backend, that's why they aren't there yet.

For the full walkthrough of switching to OTLP and verifying signals land, see [Send to an OTLP Backend](/docs/otlp-backend).

## Getting more detail

### How do I get more logs?

Set `RUST_LOG` to raise verbosity. It accepts the usual levels:

```bash
RUST_LOG=info  ./target/release/harnesssphere config.example.toml
RUST_LOG=warn  ./target/release/harnesssphere config.example.toml
RUST_LOG=trace ./target/release/harnesssphere config.example.toml
```

`trace` is the most verbose and is the best starting point when you're trying to understand exactly what a collector is doing.

## What actually works today

### Which layers actually work today?

Working today:

- The **Host** and **Self** collectors — CPU, memory, swap, and the watcher's own process footprint. These are the two Critical layers.
- The **stdout** exporter and the **OTLP/gRPC** metrics exporter.
- The **ingest plane** (feature `ingest`) — a local OTLP/gRPC receiver that converts incoming metrics to the canonical model and enriches them with host context.

On the roadmap:

- The Optional collectors: **container**, **gateway**, **harness**, **tools**, and **API**.

So if you're not seeing container, gateway, harness, tool, or API signals, it's because those collectors aren't shipping yet — not because something is misconfigured.

## Privacy

### Is my prompt/response content captured?

**No.** Privacy is the default. Prompt and completion *content* is **never** captured unless you explicitly opt in, per layer. By default you get counts, durations, and status — not the text of what flowed through.

## Tuning

### Collection feels too frequent or not frequent enough

Tune the **collection cadence** with the per-collector interval keys:

```toml
host_interval_secs = 5    # how often the host layer is read
self_interval_secs = 10   # how often the watcher reads its own footprint
```

### Signals leave the watcher too slowly or too often

That's the **export cadence**, controlled separately:

```toml
metric_export_interval_secs = 15   # how often the OTLP metric reader ships
```

The interval keys decide how *frequently* metrics are sampled; `metric_export_interval_secs` decides how *frequently* they leave the watcher for your backend. See [Configuration](/docs/configuration) for all keys, defaults, and environment-variable overrides.
