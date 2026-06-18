# Conectar OpenClaw, Hermes e PicoClaw

O HarnessSphere foi projetado para se encaixar nas ferramentas reais que as pessoas rodam em um host Claw/Harness. Este guia explica como os componentes do lado da IA se conectam ao HarnessSphere, por que eles **empurram** (push) sua telemetria em vez de serem raspados (scrape), e como compilar o receptor que a recebe.

## Por que esses componentes fazem push (em vez de serem observados)

Para o host e o próprio watcher, o HarnessSphere faz **pull** — ele vai até o sistema operacional e lê os dados nativamente. Mas os dados interessantes da IA ficam em um lugar que um watcher passivo não alcança: são *internos à aplicação*. Um watcher do lado de fora do processo não consegue ver tokens consumidos, hits do índice de busca, nem o formato de uma transação de IA.

Então os componentes fazem o oposto: eles **empurram OTLP** (push) para um receptor local que o HarnessSphere executa — o **ingest plane** (feature do Cargo `ingest`). Quando um sinal chega ali, o HarnessSphere:

- converte cada métrica recebida para o seu **modelo canônico de sinais**,
- **preserva a identidade de origem** (`service.name`, `gen_ai.provider`/`gen_ai.model` a partir do Resource do OTLP),
- **enriquece com contexto do host** (`host.name`, container id),
- **normaliza** convenções divergentes em `gen_ai.*` limpo,
- e encaminha **um único fluxo organizado** adiante, pelo mesmo pipeline dos sinais coletados via pull.

Como os caminhos de push e de pull convergem para um único modelo e um único pipeline, a telemetria da IA e a do host acabam correlacionadas — mesmo host, mesma linha do tempo.

## Os componentes

### OpenClaw

O OpenClaw **empurra OTLP** (push) e também expõe um endpoint Prometheus em `/api/diagnostics/prometheus`. Ele emite tanto as métricas padrão `gen_ai.*` quanto suas próprias chaves `openclaw.*` (por exemplo, `openclaw.tool.execution.*`).

Como esse endpoint Prometheus existe, o HarnessSphere também pode **raspá-lo** (scrape) — o mesmo endpoint que ele usa para ler o gateway. As métricas Prometheus `openclaw.*` também podem ser captadas dessa forma.

### Hermes Agent

O Hermes Agent empurra **spans OTLP aninhados** para sessões, chamadas de LLM e ferramentas, via `hermes-otel`. As chamadas de ferramenta chegam como spans `tool.{name}`, aninhados sob o span de IA pai — de modo que a estrutura da sessão permanece intacta quando chega ao HarnessSphere.

### PicoClaw

O PicoClaw é a opção ultraleve — perfeito para os alvos Raspberry Pi nos quais o próprio HarnessSphere roda.

## O que funciona hoje vs. o que está no roadmap

O **ingest plane está verificado de ponta a ponta hoje**: uma instância do HarnessSphere empurrando OTLP para outra, com os sinais chegando do outro lado já enriquecidos com `host.name`. O receptor OTLP local hoje fala **gRPC na `:4317`**.

Várias etapas de enriquecimento e normalização estão projetadas e no roadmap:

| Capacidade | Status |
|---|---|
| Receptor OTLP local via gRPC (`:4317`) | Funciona hoje |
| Métricas recebidas convertidas para o modelo canônico | Funciona hoje |
| Enriquecimento com `host.name` | Funciona hoje |
| Normalização de convenções (ex.: Hermes `llm.token_count.*` → `gen_ai.*`) | Roadmap |
| Enriquecimento com `container.id` | Roadmap |
| Redação de conteúdo (content redaction) | Roadmap |
| Receptor HTTP (`:4318`) | Roadmap |

## Compilando o receptor

O ingest plane fica atrás de uma feature do Cargo. Compile o binário com ela habilitada:

```bash
cargo build --release --features ingest
```

A feature `ingest` pode ser combinada com a feature de exportação `otlp`, de modo que o mesmo binário consegue receber OTLP via push *e* encaminhar tudo para o seu backend via OTLP. Habilite ambas as feature flags no momento da compilação:

- `ingest` — o receptor OTLP local (o alvo do push).
- `otlp` — o exportador OTLP que envia o fluxo enriquecido para o seu backend.

Depois de compilado, aponte seus componentes para o receptor gRPC local na `:4317` e eles começarão a fazer push.

## Próximos passos

- [Send to an OTLP Backend](/docs/otlp-backend) — encaminhe o fluxo enriquecido do ingest plane para um backend de observabilidade real.
- [Troubleshooting](/docs/troubleshooting) — o que verificar quando os sinais não estão chegando ou não estão enriquecidos como esperado.
