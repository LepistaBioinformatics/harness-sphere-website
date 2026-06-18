# Send to an OTLP Backend

By default HarnessSphere uses the **stdout** exporter, which prints each signal as a human-readable line straight to your terminal — perfect for a first look, no infrastructure required. When you're ready to send to a real backend, switch to **OTLP** and ship your signals to any OpenTelemetry collector.

## Build with the OTLP adapter

The OTLP exporter lives behind a Cargo feature, so build the release binary with the `otlp` feature enabled:

```bash
cargo build --release --features otlp
```

## Point it at a collector

With the OTLP-capable binary built, point HarnessSphere at any OpenTelemetry collector over gRPC. Set the endpoint and select the OTLP exporter via environment variables:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 HARNESSSPHERE_EXPORTER=otlp ./target/release/harnesssphere config.example.toml
```

- `OTEL_EXPORTER_OTLP_ENDPOINT` sets the OTLP/gRPC endpoint.
- `HARNESSSPHERE_EXPORTER=otlp` selects the active exporter.

Prefer to keep this in your config file? You can set `exporter = "otlp"` and `otlp_endpoint` directly in the TOML instead of using environment variables. See [Configuration](/docs/configuration) for the full list of keys and their defaults.

## Want to actually see it?

Spin up a local [SigNoz](https://signoz.io) and watch the signals land in a dashboard — one command:

```bash
docker compose -f deploy/signoz/docker/docker-compose.yaml up -d
```

This brings up the SigNoz UI at port **:8080** and an OTLP endpoint at port **:4317** — which is exactly where the example endpoint above points. Build with `--features otlp`, run with the OTLP exporter, and your Host and Self metrics should start arriving in SigNoz.

## What's verified today

The OTLP/gRPC **metrics** path is confirmed end-to-end against a real OpenTelemetry Collector. OTLP for **logs and traces** is on the roadmap — today the OTLP path covers metrics.

## Next steps

- [Connect to the Ecosystem](/docs/connect-ecosystem) — wire HarnessSphere into the components that push to it.
- [Troubleshooting](/docs/troubleshooting) — what to check when signals aren't arriving.
