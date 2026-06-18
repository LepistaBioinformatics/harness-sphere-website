# Getting Started

HarnessSphere is a single, self-contained binary that watches every layer of a host running the Claw/Harness AI stack and turns what it sees into clean, standard **OpenTelemetry** signals. This guide walks you through building it and running it for the very first time — no backend required.

## Prerequisites

You'll need **Rust (stable)**. The repository pins the exact toolchain via `rust-toolchain.toml`, so once you have a working Rust install the right version is selected automatically.

## Build it

Build the release binary:

```bash
cargo build --release
```

## Run it

By default HarnessSphere uses the **stdout** exporter, which prints each signal as a human-readable line straight to your terminal — perfect for a first look. Point it at the example config and run:

```bash
./target/release/harnesssphere config.example.toml
```

The config file is passed as the first argument. With the stdout exporter active, every canonical signal HarnessSphere collects is printed to the terminal as it happens, so you can watch the watcher work without any external infrastructure.

## What you'll see

The collectors shipping today are the two **Critical** layers — **Host** and the **Watcher itself (Self)**. These are the layers HarnessSphere refuses to run blind without, so they're the first things you'll see streaming by.

### Host

The physical (or virtual) machine underneath everything:

| Signal | Key | What it tells you |
|---|---|---|
| Metric | `system.cpu.utilization` | Fraction of CPU currently in use |
| Metric | `system.memory.usage` | Bytes of RAM by state — `used` / `free` / `available` |
| Metric | `system.memory.utilization` | Fraction of RAM in use |
| Metric | `system.paging.usage` | Swap currently used |
| Metric | `system.paging.utilization` | Fraction of swap in use |

### The Watcher itself (Self)

HarnessSphere reports its own footprint so a tool you can't see never becomes a liability:

| Signal | Key | What it tells you |
|---|---|---|
| Metric | `process.cpu.utilization` | CPU the watcher itself is using |
| Metric | `process.memory.usage` | Watcher's resident memory (RSS) |
| Metric | `process.memory.virtual` | Watcher's virtual memory |

In short: **CPU, memory, swap, and the watcher's own process footprint** — read natively from the OS, no privileges needed.

Every signal also carries a global **Resource** so you always know where it came from: `service.name=harnesssphere`, `service.version`, plus `host.name`, `host.id`, `host.arch` and `os.type`.

## Next steps

Once you've seen signals printing to your terminal, here's where to go next:

- [Configuration](/docs/configuration) — tune collection intervals, thresholds, and the exporter via TOML and environment variables.
- [Send to an OTLP Backend](/docs/otlp-backend) — switch from stdout to OTLP and ship signals to a real observability backend.
- [Understanding the Layers](/docs/understanding-layers) — the full picture of the seven layers HarnessSphere models and how each one is collected.
