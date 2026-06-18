# Configuration

HarnessSphere is configured with a single **TOML file**, passed as the first argument when you run the binary. A handful of **environment variables** can override individual settings at launch — handy for switching exporters or endpoints without editing the file.

```bash
./target/release/harnesssphere config.example.toml
```

## Configuration keys

These are the keys you can set in the TOML file, with their defaults and meaning:

| Key | Default | Meaning |
|---|---|---|
| `host_interval_secs` | `5` | How often to collect host metrics |
| `self_interval_secs` | `10` | How often to collect the watcher's own metrics |
| `critical_threshold` | `3` | Consecutive failures before a Critical collector is fatal |
| `exporter` | `"stdout"` | `"stdout"` or `"otlp"` |
| `otlp_endpoint` | `http://localhost:4317` | OTLP/gRPC endpoint (when `exporter = "otlp"`) |
| `service_name` | `harnesssphere` | `service.name` on the OTel Resource |
| `metric_export_interval_secs` | `15` | How often the OTLP metric reader ships |

## Environment variable overrides

These environment variables take precedence over the values in the TOML file:

| Environment variable | Overrides |
|---|---|
| `HARNESSSPHERE_EXPORTER` | the active exporter |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | the OTLP endpoint |
| `RUST_LOG` | log verbosity (e.g. `info`, `warn`, `trace`) |

## Example config

A minimal configuration using the documented keys looks like this:

```toml
host_interval_secs = 5     # host collection interval (Critical)
self_interval_secs = 10    # self-observability interval (Critical)
critical_threshold = 3     # consecutive failures of a Critical before exiting (exit != 0)
exporter = "otlp"        # "stdout" or "otlp" (the latter needs the `otlp` feature)

# OTLP exporter (when exporter = "otlp"; build with --features otlp)
otlp_endpoint = "http://localhost:4317"
service_name = "harnesssphere"
metric_export_interval_secs = 15
```

## Intervals and export cadence

HarnessSphere gathers data by **pulling** (reading host and self metrics on a timer) and by **receiving** (signals pushed in over OTLP). The interval keys control these rhythms:

- **Pull cadence** is configurable per collector. `host_interval_secs` sets how often the host layer is read, and `self_interval_secs` sets how often the watcher reads its own footprint.
- **Export cadence** to your backend is driven by `metric_export_interval_secs` — how often the OTLP metric reader ships what it has collected to your OpenTelemetry backend.

In other words: the interval keys decide how *frequently* metrics are sampled, while `metric_export_interval_secs` decides how *frequently* they leave the watcher for your backend.

## Next steps

- [Send to an OTLP Backend](/docs/otlp-backend) — switch from stdout to OTLP and ship signals to a real observability backend.
- [Getting Started](/docs/getting-started) — build the binary and run it for the first time.
