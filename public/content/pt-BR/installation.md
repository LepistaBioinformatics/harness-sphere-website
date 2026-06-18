# Instalação e Plataformas

O HarnessSphere é um único binário autocontido. **Não há runtime para instalar**, nenhum
sidecar para cuidar e nenhuma pilha de exportadores separados para interligar. Você
coloca um único arquivo em uma máquina e ele começa a observar.

Como o binário é **estaticamente vinculado**, ele leva tudo o que precisa consigo. O mesmo
artefato roda desde um servidor Linux robusto até um Raspberry Pi.

## Um binário, sem runtime

- **Autocontido.** Tudo é compilado em um único executável — sem interpretador, sem caça a
  bibliotecas compartilhadas, sem necessidade de gerenciador de pacotes no host de destino.
- **Estaticamente vinculado.** As builds suportadas vinculam contra **musl** (ou produzem
  um binário universal para macOS), portanto não há dependências dinâmicas a satisfazer no
  momento do deploy.
- **Portátil por design.** Copie o binário para o host, torne-o executável e execute.

## Plataformas e targets suportados

Estas são as plataformas para as quais o HarnessSphere é compilado, o triplo de target do
Rust exato para cada uma e a ferramenta usada para produzir a build.

| Plataforma | Target | Como |
|---|---|---|
| Linux x86_64 (static) | `x86_64-unknown-linux-musl` | `cross` |
| Linux ARM64 (static) | `aarch64-unknown-linux-musl` | `cross` |
| Raspberry Pi 32-bit | `armv7-unknown-linux-musleabihf` | `cross` |
| Raspberry Pi 64-bit | `aarch64-unknown-linux-musl` | `cross` |
| macOS (Intel + Apple Silicon) | `universal2-apple-darwin` | `cargo-zigbuild` |

Os targets de Linux e Raspberry Pi são produzidos com [`cross`](https://github.com/cross-rs/cross),
e o binário universal para macOS (Intel + Apple Silicon em um único artefato) é produzido
com [`cargo-zigbuild`](https://github.com/rust-cross/cargo-zigbuild).

## Compilando a partir do código-fonte

Você precisará do **Rust (stable)**. A partir da raiz do repositório, uma build de release
padrão é tudo o que é necessário:

```bash
cargo build --release
```

O binário resultante fica em `./target/release/harnesssphere`.

### Compilando com features

O HarnessSphere mantém capacidades opcionais atrás de features do Cargo para que o binário
padrão permaneça pequeno. Por exemplo, o exportador OTLP é habilitado com `--features otlp`:

```bash
cargo build --release --features otlp
```

Compilar com features — e enviar os sinais para um backend OpenTelemetry real — é abordado
em [Enviar para um Backend OTLP](/docs/otlp-backend).

## O perfil de release

O perfil de release é ajustado para um **binário pequeno e sem dependências**:

- `opt-level = "z"` — otimizar para tamanho.
- **LTO** (otimização em tempo de linkagem).
- Símbolos **removidos** (stripped).

Uma coisa que deliberadamente *não* é cortada: o **panic unwinding é mantido de propósito**.
O modelo de resiliência depende dele — os coletores rodam em tarefas isoladas e um panic
inesperado é *contido* em vez de derrubar o watcher inteiro, então o unwinding precisa
permanecer habilitado.

## Próximos passos

- [Primeiros Passos](/docs/getting-started) — execute o binário e veja seus primeiros sinais.
- [Configuração](/docs/configuration) — ajuste intervalos, exportadores e limiares.
