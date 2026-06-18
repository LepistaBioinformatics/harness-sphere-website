# Entendendo as Camadas

O HarnessSphere é um único binário autocontido que observa uma máquina rodando o
ecossistema de IA Claw/Harness e transforma tudo o que vê em sinais
**OpenTelemetry** limpos e padronizados. Para isso, ele modela o host como **sete
camadas** — e entender essas camadas é a chave para entender o que o HarnessSphere
realmente observa.

Esta página explica o modelo de sete camadas, o que cada camada reporta, como os dados são
coletados e quais camadas já estão disponíveis hoje versus quais estão no roadmap.

---

## O modelo de sete camadas

Rodar um agente de IA em produção significa, na prática, rodar vários sistemas empilhados
uns sobre os outros: o hardware, o contêiner, o gateway que roteia o tráfego dos modelos, o
próprio harness de IA, as ferramentas que ele executa e as chamadas de API que entram e
saem. O HarnessSphere trata cada um deles como um **módulo isolado** — uma camada, uma
responsabilidade.

As sete camadas são:

| Camada | Criticidade | O que cobre |
|---|---|---|
| Host | **Crítica** | A máquina física ou virtual por baixo de tudo |
| O Observador (Self) | **Crítica** | O HarnessSphere observando sua própria pegada e saúde |
| Container | Opcional | Limites e uso de cgroup v2 quando roda em contêiner |
| Gateway | Opcional | O plano de controle que roteia o tráfego de modelos do harness |
| Harness (a IA) | Opcional | Tokens, operações de IA, memória, índice de busca |
| Tools | Opcional | Toda ferramenta que a IA invoca, cronometrada e contada |
| API Calls | Opcional | Tráfego HTTP e gRPC que entra e sai |

### Crítica vs. Opcional

A distinção entre camadas **Críticas** e **Opcionais** é o cerne de como o HarnessSphere se
comporta:

- **Camadas Críticas — apenas Host e Self.** O observador se recusa a rodar às cegas sem
  elas. Se uma camada Crítica falha de forma *persistente* (acima de um limiar configurável
  — um soluço transitório isolado é perdoado), o observador descarrega o que consegue e sai
  ruidosamente com código de saída diferente de zero.
- **Camadas Opcionais — todo o resto.** Se estiverem ausentes ou se comportando mal, elas
  silenciosamente saem de cena. Um contêiner ausente ou um gateway inacessível é tratado
  como `Unavailable`/`NotApplicable`, não como uma falha. Camadas Opcionais degradam, recuam,
  tentam novamente e **nunca** derrubam o processo.

Em outras palavras: o HarnessSphere não vai fingir que monitora uma máquina que não
consegue de fato ler, mas continuará rodando alegremente mesmo quando as camadas
específicas de IA ainda não estiverem presentes.

---

## As camadas, uma a uma

> **Legenda** — `M` Métrica · `L` Log · `T` Trace/Span. Instrumentos: **G**auge,
> **C**ounter, **UDC** UpDownCounter, **H**istogram.
> Status: ✅ disponível hoje · 🟡 desenhada & especificada (no roadmap).
> Chaves com o prefixo `harnesssphere.*` são o namespace próprio do HarnessSphere, usado
> onde ainda não existe uma convenção semântica oficial do OpenTelemetry.

### 🖥️ Host — *Crítica*

A máquina física (ou virtual) por baixo de tudo. Se o HarnessSphere não consegue ler o
host, não há sentido em fingir que monitora qualquer coisa — por isso esta camada é
obrigatória.

Ela reporta utilização de CPU, uso de memória (dividido em used / free / available) e
utilização geral de memória, além de uso e utilização de swap (paging). No roadmap, ela
adiciona tempo de CPU acumulado por estado, vazão e tempo ocupado de disco, espaço de
sistema de arquivos por ponto de montagem, I/O de rede, contagens/quedas/erros de pacotes,
contagens de conexões abertas e eventos estruturados de saúde do host (disco quase cheio,
OOM iminente). O host é não-transacional, então não tem spans.

| Sinal | Chave | O que indica | Status |
|---|---|---|---|
| M | `system.cpu.utilization` | Fração de CPU em uso no momento | ✅ |
| M | `system.memory.usage` | Bytes de RAM por estado — used / free / available | ✅ |
| M | `system.memory.utilization` | Fração de RAM em uso | ✅ |
| M | `system.paging.usage` / `system.paging.utilization` | Swap usado e fração em uso | ✅ |
| M | `system.cpu.time` | Tempo de CPU acumulado por estado | 🟡 |
| M | `system.disk.*`, `system.filesystem.*`, `system.network.*` | Atividade de disco, sistema de arquivos e rede | 🟡 |
| L | eventos de saúde do host | Disco quase cheio, OOM iminente, etc. | 🟡 |

### 🛰️ O Observador (Self) — *Crítica*

O HarnessSphere cuida das próprias costas. Uma ferramenta de monitoramento que você não
consegue enxergar é um risco, então ela reporta sua própria pegada e o quão saudável está
seu laço de coleta. Também obrigatória.

Ela reporta a utilização de CPU do próprio observador e sua memória (RSS residente e
virtual). No roadmap, ela adiciona contagens de threads e descritores de arquivo abertos,
durações de scrape e de ciclo completo de coleta, contagens de scrape por resultado
(`success` / `error` / `panic`), estado de saúde por coletor (`0` ready · `1` degraded ·
`2` unavailable), sinais descartados sob backpressure, logs de falhas de scrape e
transições de estado, e um span por ciclo de coleta com um span filho por coletor.

| Sinal | Chave | O que indica | Status |
|---|---|---|---|
| M | `process.cpu.utilization` | CPU que o próprio observador está usando | ✅ |
| M | `process.memory.usage` | Memória residente do observador (RSS) | ✅ |
| M | `process.memory.virtual` | Memória virtual do observador | ✅ |
| M | `harnesssphere.collector.state` | Saúde por coletor: ready / degraded / unavailable | 🟡 |
| M | `harnesssphere.export.items.dropped` | Sinais descartados sob backpressure | 🟡 |
| T | `harnesssphere.collection.cycle` | Um span por ciclo, span filho por coletor | 🟡 |

### 📦 Container — *Opcional*

Se o harness roda dentro de um contêiner, o HarnessSphere lê suas estatísticas de **cgroup
v2** diretamente do kernel — sem socket do Docker, sem API de runtime, sem permissões
extras.

Ela reporta o consumo de CPU do contêiner, a memória em uso, o teto de memória do
contêiner, eventos de OOM / throttle, throttling de CPU e I/O de disco, além de um log que
avisa quando o contêiner desaparece do cgroup. Como o host, as métricas de cgroup são
não-transacionais, então não há spans.

| Sinal | Chave | O que indica | Status |
|---|---|---|---|
| M | `container.cpu.time` / `container.cpu.usage` | CPU consumida pelo contêiner | 🟡 |
| M | `container.memory.usage` | Memória do contêiner em uso | 🟡 |
| M | `harnesssphere.container.memory.limit` | O teto de memória do contêiner | 🟡 |
| M | `harnesssphere.container.memory.throttled` / `…cpu.throttled` | Eventos de OOM/throttle e throttling de CPU | 🟡 |
| L | ciclo de vida do contêiner | Avisa quando o contêiner desaparece | 🟡 |

### 🚪 Gateway — *Opcional*

O plano de controle que roteia o tráfego de modelos do harness. O HarnessSphere mede a
latência de rota e a saúde das conexões — fazendo scrape do endpoint Prometheus do gateway
e/ou recebendo o que ele empurra via OTLP.

Ela reporta a latência de requisição por rota (marcada com método, rota e código de
status), requisições em andamento, se o gateway/rota está acessível, conexões ativas por
estado e a latência da própria sonda de saúde do observador. Ela registra conexões
derrubadas e falhas 5xx upstream, e encaminha o `traceparent` propagado para manter os
traces de IA conectados.

| Sinal | Chave | O que indica | Status |
|---|---|---|---|
| M | `http.server.request.duration` | Latência por rota por método, rota, status | 🟡 |
| M | `http.server.active_requests` | Requisições em andamento | 🟡 |
| M | `harnesssphere.gateway.up` | O gateway/rota está acessível? | 🟡 |
| M | `harnesssphere.gateway.probe.latency` | Latência da própria sonda de saúde do observador | 🟡 |
| T | trace passthrough | `traceparent` propagado encaminhado para manter os traces de IA conectados | 🟡 |

### 🧠 Harness (a IA) — *Opcional* · a estrela do show

É isto que torna o HarnessSphere especial. Ela segue as **convenções semânticas GenAI**
oficiais (`gen_ai.*`), de modo que contagens de tokens, durações de requisições e
transações de IA chegam ao seu backend em um formato padronizado e neutro em relação a
fornecedores.

Ela reporta tokens consumidos (divididos por `input` / `output`, modelo e provedor),
latência ponta a ponta das operações de IA, contagens de mensagens por papel, tokens de
leitura e criação de cache, o tamanho da memória do harness, e consultas e taxa de acerto
do índice de busca. Ela registra erros, recusas e cortes do modelo, e emite um span por
transação de IA (ex.: `chat gpt-4o-mini`) mais a estrutura de agente/turno quando o harness
a expõe.

| Sinal | Chave | O que indica | Status |
|---|---|---|---|
| M | `gen_ai.client.token.usage` | Tokens por input/output, modelo e provedor | 🟡 |
| M | `gen_ai.client.operation.duration` | Latência ponta a ponta de cada operação de IA | 🟡 |
| M | `harnesssphere.harness.messages` | Contagens de mensagens por papel | 🟡 |
| M | `harnesssphere.harness.search_index.hit_ratio` | Taxa de acerto do índice de busca | 🟡 |
| L | erros / recusas / cortes do modelo | Motivos de finalização e tipos de erro | 🟡 |
| T | `{operation} {model}` | Um span por transação de IA | 🟡 |

### 🔧 Tools — *Opcional*

Toda ferramenta que a IA invoca, cronometrada e contada, seguindo a convenção de span
`execute_tool` da GenAI.

Ela reporta quanto tempo cada ferramenta leva (por nome e resultado) e a contagem de
chamadas por ferramenta, registra erros de execução de ferramenta (nome, tipo de erro e
mensagem), e emite um span `execute_tool` por chamada, aninhado sob o span de IA pai.

| Sinal | Chave | O que indica | Status |
|---|---|---|---|
| M | `harnesssphere.tool.execution.duration` | Quanto tempo cada ferramenta leva, por nome e resultado | 🟡 |
| M | `harnesssphere.tool.calls` | Contagem de chamadas por ferramenta | 🟡 |
| L | erros de execução de ferramenta | Nome da ferramenta, tipo de erro e mensagem | 🟡 |
| T | `execute_tool {tool_name}` | Um span por chamada de ferramenta, aninhado sob o span de IA pai | 🟡 |

### 🌐 API Calls — *Opcional*

O tráfego HTTP e gRPC que entra e sai, usando as convenções padrão `http.*` e `rpc.*`.

Ela reporta a latência de requisições de entrada/saída (com método, rota e status),
tamanhos de payload, latência gRPC (com serviço, método e código de status), e contagens de
requisições por direção e classe de status (2xx/4xx/5xx). Ela registra respostas 4xx/5xx e
emite spans HTTP/gRPC de cliente e servidor, correlacionados com os traces de IA acima.

| Sinal | Chave | O que indica | Status |
|---|---|---|---|
| M | `http.client.request.duration` / `http.server.request.duration` | Latência de requisição de saída/entrada | 🟡 |
| M | `rpc.client.duration` / `rpc.server.duration` | Latência gRPC por serviço, método, status | 🟡 |
| M | `harnesssphere.api.requests` | Contagens de requisições por direção e classe de status | 🟡 |
| L | respostas 4xx / 5xx | Método, rota, status e latência | 🟡 |
| T | spans de cliente/servidor | Spans HTTP/gRPC correlacionados com os traces de IA | 🟡 |

> Todo sinal também carrega um **Resource** global, então você sempre sabe *de onde* ele
> veio: `service.name=harnesssphere`, `service.version`, mais `host.name`, `host.id`,
> `host.arch` e `os.type`.

---

## Como os sinais são coletados: Pull vs. Receive

O HarnessSphere reúne dados de duas formas.

- **Pull** — ele alcança e lê ou faz scrape de um alvo. As camadas host e self são puxadas
  da crate `sysinfo` (que lê o SO nativamente); a camada container é puxada lendo os
  arquivos de cgroup v2 diretamente; o gateway é puxado fazendo scrape do seu endpoint
  Prometheus mais uma sonda de saúde ativa.
- **Receive / Push** — ele deixa um alvo empurrar dados para ele via **ingestão OTLP**. As
  camadas harness, tools e API calls são *internas ao app* — um observador passivo não
  consegue ver tokens ou acertos do índice de busca — então componentes como OpenClaw e
  Hermes **empurram OTLP** para o receptor local do HarnessSphere.

| Camada | Mecanismo | Status |
|---|---|---|
| Host | Pull — crate `sysinfo` | ✅ |
| Observador (Self) | Pull — API de processo do `sysinfo` | ✅ |
| Container | Pull — cgroup v2, lido diretamente | 🟡 |
| Gateway | Pull — scrape Prometheus + sonda ativa | 🟡 |
| Harness (IA) | Push — ingestão OTLP (+ Prometheus) | 🟡 ingestão ✅ |
| Tools | Push — ingestão OTLP | 🟡 |
| API Calls | Push — ingestão OTLP (+ scrape) | 🟡 |

### Um pipeline canônico

A parte importante é o que acontece *depois* da coleta. Um sinal **puxado (pull)** é lido
por um coletor, transformado em um `Metric` / `Log` / `Span` canônico, e colocado em um
canal interno. Um sinal **empurrado (push)** chega ao receptor OTLP, é convertido de OTLP
para esse mesmo formato canônico, **enriquecido com contexto de host** (como `host.name`)
preservando sua identidade de origem, e colocado no mesmo canal.

A partir daí, um único dreno de batching entrega tudo ao exportador ativo. Como ambos os
caminhos convergem para **um modelo e um pipeline**, a telemetria de IA e a telemetria de
host acabam **correlacionadas** — mesmo host, mesma linha do tempo, mesmo trace. Essa
correlação é exatamente o que permite ligar uma lentidão de IA à pressão de recursos que a
causou.

---

## Privacidade por padrão

O **conteúdo** de prompt e completion **nunca** é capturado a menos que você opte
explicitamente por isso, por camada. Por padrão você recebe contagens, durações e status —
não texto. Privacidade é o padrão, não um detalhe posterior.

---

## O que está disponível hoje

O HarnessSphere está em desenvolvimento ativo, e as camadas refletem isso:

- **Host** e **Self** estão disponíveis hoje (✅) — são as camadas Críticas, então tinham
  que vir primeiro.
- **A maioria das outras camadas está no roadmap** (🟡): container, gateway, harness, tools
  e API calls estão desenhadas e especificadas, com o plano de ingestão do harness já
  verificado ponta a ponta para métricas.

---

## Próximos passos

- Veja [`/docs/configuration`](/docs/configuration) para ajustar os intervalos de coleta, o
  limiar de falha Crítica e o opt-in por camada.
- Veja [`/docs/otlp-backend`](/docs/otlp-backend) para apontar o HarnessSphere ao seu
  backend OpenTelemetry via OTLP.
