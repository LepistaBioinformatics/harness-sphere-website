# Solução de Problemas e FAQ

O HarnessSphere foi feito para ficar quieto quando está tudo bem e só falar alto quando algo realmente exige sua atenção. A maioria das surpresas que as pessoas encontram não são bugs — é o modelo de resiliência fazendo exatamente aquilo para o qual foi projetado. Esta página percorre as dúvidas mais comuns, o que o comportamento de fato significa e o que (se é que há algo) você deve fazer a respeito.

## Falhas e códigos de saída

### O watcher saiu com um código diferente de zero

Isso é **intencional**, e acontece por um único motivo: um collector **Crítico** falhou de forma *persistente*.

Apenas duas camadas são Críticas — **Host** e **Self** (o watcher observando o próprio consumo). Se uma delas continuar falhando além de `critical_threshold` falhas *consecutivas*, o HarnessSphere descarrega o que consegue e sai de forma ruidosa com um código diferente de zero. Um watcher que não consegue ler o host ou não consegue enxergar a si mesmo está cego, e um watcher cego é pior do que nenhum watcher — então ele se recusa a continuar fingindo.

Um **único soluço transitório é perdoado**. O limiar conta falhas *consecutivas*; uma coleta ruim seguida de uma boa zera a contagem.

O limiar padrão é `3`:

```toml
critical_threshold = 3   # consecutive Critical failures before exiting (exit != 0)
```

Se quiser mais tolerância em um ambiente instável, aumente-o. Se quiser falhar rápido, diminua-o. Veja [Configuração](/docs/configuration) para a referência completa das chaves.

### Tudo exceto Host e Self pode falhar sem derrubar o watcher

Vale repetir, porque é o outro lado da regra acima: os collectors Opcionais (container, gateway, harness, tools, API) **nunca** derrubam o processo. Eles degradam, recuam e tentam de novo. Apenas um collector Host ou Self falhando de forma persistente é fatal.

## Alvos "ausentes" que não são de fato erros

### Não tenho container / nenhum gateway respondendo

Isso não é uma falha, e nem sequer é um erro. Um alvo ausente é reportado como `Unavailable` / `NotApplicable`.

Quando não há container para ler, ou nenhum gateway respondendo, o collector Opcional correspondente simplesmente **fica de fora e continua sondando**. Ele nunca derruba o processo. Se o alvo aparecer mais tarde, o collector o retoma. Não há nada para corrigir aqui.

### Meu backend de OpenTelemetry está fora do ar

A coleta continua rodando. Se o seu endpoint de OpenTelemetry desaparecer, **a exportação falha silenciosamente em segundo plano** enquanto o HarnessSphere segue coletando sinais. Um backend morto nunca bloqueia a coleta — quando o backend volta, a exportação é retomada.

## Nada aparecendo no meu backend

### Não vejo nada no meu backend

Se a coleta está rodando mas nada chega ao seu backend de observabilidade, verifique o seguinte, nesta ordem:

1. **O exporter está definido como `otlp`.** O exporter padrão é `stdout`, que imprime no seu terminal e não envia nada pela rede. Defina-o explicitamente:

   ```bash
   HARNESSSPHERE_EXPORTER=otlp \
     ./target/release/harnesssphere config.example.toml
   ```

   Note que o adaptador OTLP precisa estar compilado (`cargo build --release --features otlp`).

2. **`OTEL_EXPORTER_OTLP_ENDPOINT` aponta para um collector gRPC acessível.** Ele deve apontar para a porta OTLP/gRPC do seu collector, convencionalmente `:4317`:

   ```bash
   OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 \
   HARNESSSPHERE_EXPORTER=otlp \
     ./target/release/harnesssphere config.example.toml
   ```

3. **Lembre-se de que hoje apenas métricas trafegam por OTLP.** Logs e traces estão no roadmap — se você está procurando spans ou linhas de log no seu backend, é por isso que eles ainda não estão lá.

Para o passo a passo completo de como mudar para OTLP e verificar a chegada dos sinais, veja [Enviar para um Backend OTLP](/docs/otlp-backend).

## Obtendo mais detalhe

### Como obtenho mais logs?

Defina `RUST_LOG` para aumentar a verbosidade. Ela aceita os níveis usuais:

```bash
RUST_LOG=info  ./target/release/harnesssphere config.example.toml
RUST_LOG=warn  ./target/release/harnesssphere config.example.toml
RUST_LOG=trace ./target/release/harnesssphere config.example.toml
```

`trace` é o mais verboso e é o melhor ponto de partida quando você está tentando entender exatamente o que um collector está fazendo.

## O que de fato funciona hoje

### Quais camadas de fato funcionam hoje?

Funcionando hoje:

- Os collectors **Host** e **Self** — CPU, memória, swap e o consumo do próprio processo do watcher. Estas são as duas camadas Críticas.
- O exporter **stdout** e o exporter de métricas **OTLP/gRPC**.
- O **plano de ingest** (feature `ingest`) — um receptor OTLP/gRPC local que converte as métricas recebidas para o modelo canônico e as enriquece com contexto do host.

No roadmap:

- Os collectors Opcionais: **container**, **gateway**, **harness**, **tools** e **API**.

Portanto, se você não está vendo sinais de container, gateway, harness, tool ou API, é porque esses collectors ainda não estão disponíveis — não porque algo está mal configurado.

## Privacidade

### O conteúdo dos meus prompts/respostas é capturado?

**Não.** A privacidade é o padrão. O *conteúdo* de prompts e completions **nunca** é capturado a menos que você opte explicitamente por isso, por camada. Por padrão você obtém contagens, durações e status — não o texto do que passou por ali.

## Ajuste fino

### A coleta parece frequente demais ou de menos

Ajuste a **cadência de coleta** com as chaves de intervalo por collector:

```toml
host_interval_secs = 5    # how often the host layer is read
self_interval_secs = 10   # how often the watcher reads its own footprint
```

### Os sinais saem do watcher devagar demais ou com frequência demais

Essa é a **cadência de exportação**, controlada separadamente:

```toml
metric_export_interval_secs = 15   # how often the OTLP metric reader ships
```

As chaves de intervalo decidem com que *frequência* as métricas são amostradas; `metric_export_interval_secs` decide com que *frequência* elas deixam o watcher rumo ao seu backend. Veja [Configuração](/docs/configuration) para todas as chaves, padrões e sobrescritas por variável de ambiente.
