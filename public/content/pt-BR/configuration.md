# Configuração

O HarnessSphere é configurado com um único **arquivo TOML**, passado como primeiro argumento ao executar o binário. Algumas **variáveis de ambiente** podem sobrescrever configurações individuais na inicialização — útil para alternar exporters ou endpoints sem editar o arquivo.

```bash
./target/release/harnesssphere config.example.toml
```

## Chaves de configuração

Estas são as chaves que você pode definir no arquivo TOML, com seus padrões e significado:

| Key | Default | Meaning |
|---|---|---|
| `host_interval_secs` | `5` | Com que frequência coletar as métricas do host |
| `self_interval_secs` | `10` | Com que frequência coletar as métricas do próprio watcher |
| `critical_threshold` | `3` | Falhas consecutivas antes que um coletor Critical seja fatal |
| `exporter` | `"stdout"` | `"stdout"` ou `"otlp"` |
| `otlp_endpoint` | `http://localhost:4317` | Endpoint OTLP/gRPC (quando `exporter = "otlp"`) |
| `service_name` | `harnesssphere` | `service.name` no Resource do OTel |
| `metric_export_interval_secs` | `15` | Com que frequência o leitor de métricas OTLP envia os dados |

## Sobrescrita por variáveis de ambiente

Estas variáveis de ambiente têm precedência sobre os valores no arquivo TOML:

| Environment variable | Overrides |
|---|---|
| `HARNESSSPHERE_EXPORTER` | o exporter ativo |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | o endpoint OTLP |
| `RUST_LOG` | verbosidade do log (por exemplo, `info`, `warn`, `trace`) |

## Exemplo de configuração

Uma configuração mínima usando as chaves documentadas fica assim:

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

## Intervalos e cadência de exportação

O HarnessSphere coleta dados por **pull** (lendo as métricas de host e self em um temporizador) e por **recebimento** (sinais enviados via OTLP). As chaves de intervalo controlam esses ritmos:

- A **cadência de pull** é configurável por coletor. `host_interval_secs` define com que frequência a camada do host é lida, e `self_interval_secs` define com que frequência o watcher lê seu próprio footprint.
- A **cadência de exportação** para o seu backend é controlada por `metric_export_interval_secs` — com que frequência o leitor de métricas OTLP envia o que coletou para o seu backend OpenTelemetry.

Em outras palavras: as chaves de intervalo decidem com que *frequência* as métricas são amostradas, enquanto `metric_export_interval_secs` decide com que *frequência* elas deixam o watcher rumo ao seu backend.

## Próximos passos

- [Send to an OTLP Backend](/docs/otlp-backend) — alterne do stdout para o OTLP e envie sinais para um backend de observabilidade real.
- [Getting Started](/docs/getting-started) — compile o binário e execute-o pela primeira vez.
