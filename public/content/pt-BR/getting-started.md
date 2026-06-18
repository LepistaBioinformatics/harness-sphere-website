# Primeiros Passos

O HarnessSphere é um único binário autocontido que observa todas as camadas de um host rodando a stack de IA Claw/Harness e transforma o que vê em sinais **OpenTelemetry** limpos e padronizados. Este guia mostra como compilá-lo e executá-lo pela primeira vez — sem precisar de nenhum backend.

## Pré-requisitos

Você vai precisar do **Rust (stable)**. O repositório fixa a versão exata da toolchain através do `rust-toolchain.toml`, então, com uma instalação do Rust funcionando, a versão correta é selecionada automaticamente.

## Compilando

Compile o binário em modo release:

```bash
cargo build --release
```

## Executando

Por padrão, o HarnessSphere usa o exportador **stdout**, que imprime cada sinal como uma linha legível direto no seu terminal — perfeito para uma primeira olhada. Aponte para o arquivo de configuração de exemplo e execute:

```bash
./target/release/harnesssphere config.example.toml
```

O arquivo de configuração é passado como primeiro argumento. Com o exportador stdout ativo, cada sinal canônico que o HarnessSphere coleta é impresso no terminal conforme acontece, então você consegue ver o watcher trabalhando sem nenhuma infraestrutura externa.

## O que você vai ver

Os coletores que já estão disponíveis hoje são as duas camadas **Críticas** — **Host** e o **próprio Watcher (Self)**. São as camadas sem as quais o HarnessSphere se recusa a rodar às cegas, então são as primeiras coisas que você verá passando na tela.

### Host

A máquina física (ou virtual) por baixo de tudo:

| Sinal | Chave | O que indica |
|---|---|---|
| Métrica | `system.cpu.utilization` | Fração de CPU em uso no momento |
| Métrica | `system.memory.usage` | Bytes de RAM por estado — `used` / `free` / `available` |
| Métrica | `system.memory.utilization` | Fração de RAM em uso |
| Métrica | `system.paging.usage` | Swap em uso no momento |
| Métrica | `system.paging.utilization` | Fração de swap em uso |

### O próprio Watcher (Self)

O HarnessSphere reporta sua própria pegada, para que uma ferramenta que você não consegue enxergar nunca se torne um risco:

| Sinal | Chave | O que indica |
|---|---|---|
| Métrica | `process.cpu.utilization` | CPU que o próprio watcher está usando |
| Métrica | `process.memory.usage` | Memória residente do watcher (RSS) |
| Métrica | `process.memory.virtual` | Memória virtual do watcher |

Em resumo: **CPU, memória, swap e a pegada do próprio processo do watcher** — lidos nativamente do sistema operacional, sem necessidade de privilégios.

Cada sinal também carrega um **Resource** global, para que você sempre saiba de onde ele veio: `service.name=harnesssphere`, `service.version`, além de `host.name`, `host.id`, `host.arch` e `os.type`.

## Próximos passos

Depois de ver os sinais sendo impressos no seu terminal, aqui está para onde ir em seguida:

- [Configuration](/docs/configuration) — ajuste os intervalos de coleta, os limiares e o exportador via TOML e variáveis de ambiente.
- [Send to an OTLP Backend](/docs/otlp-backend) — troque o stdout pelo OTLP e envie os sinais para um backend de observabilidade real.
- [Understanding the Layers](/docs/understanding-layers) — o panorama completo das sete camadas que o HarnessSphere modela e como cada uma é coletada.
