# Installation & Platforms

HarnessSphere is a single, self-contained binary. There is **no runtime to install**, no
sidecar to babysit, and no stack of separate exporters to wire together. You drop one
file onto a machine and it starts watching.

Because the binary is **statically linked**, it carries everything it needs with it. The
same artifact runs from a beefy Linux server all the way down to a Raspberry Pi.

## One binary, no runtime

- **Self-contained.** Everything is compiled into one executable — no interpreter, no
  shared-library hunt, no package manager required on the target host.
- **Statically linked.** The supported builds link against **musl** (or produce a macOS
  universal binary), so there are no dynamic dependencies to satisfy at deploy time.
- **Portable by design.** Copy the binary to the host, make it executable, and run it.

## Supported platforms & targets

These are the platforms HarnessSphere builds for, the exact Rust target triple for each,
and the tool used to produce the build.

| Platform | Target | How |
|---|---|---|
| Linux x86_64 (static) | `x86_64-unknown-linux-musl` | `cross` |
| Linux ARM64 (static) | `aarch64-unknown-linux-musl` | `cross` |
| Raspberry Pi 32-bit | `armv7-unknown-linux-musleabihf` | `cross` |
| Raspberry Pi 64-bit | `aarch64-unknown-linux-musl` | `cross` |
| macOS (Intel + Apple Silicon) | `universal2-apple-darwin` | `cargo-zigbuild` |

The Linux and Raspberry Pi targets are produced with [`cross`](https://github.com/cross-rs/cross),
and the macOS universal binary (Intel + Apple Silicon in one artifact) is produced with
[`cargo-zigbuild`](https://github.com/rust-cross/cargo-zigbuild).

## Building from source

You'll need **Rust (stable)**. From the repository root, a standard release build is all
it takes:

```bash
cargo build --release
```

The resulting binary lands at `./target/release/harnesssphere`.

### Building with features

HarnessSphere keeps optional capabilities behind Cargo features so the default binary
stays small. For example, the OTLP exporter is enabled with `--features otlp`:

```bash
cargo build --release --features otlp
```

Building with features — and sending signals to a real OpenTelemetry backend — is covered
in [Send to an OTLP Backend](/docs/otlp-backend).

## The release profile

The release profile is tuned for a **small, dependency-free binary**:

- `opt-level = "z"` — optimize for size.
- **LTO** (link-time optimization).
- **Stripped** symbols.

One thing that is deliberately *not* trimmed: **panic unwinding is kept on purpose**. The
resilience model depends on it — collectors run in isolated tasks and an unexpected panic
is *contained* rather than allowed to take the whole watcher down, so unwinding has to
stay enabled.

## Next steps

- [Getting Started](/docs/getting-started) — run the binary and see your first signals.
- [Configuration](/docs/configuration) — tune intervals, exporters, and thresholds.
