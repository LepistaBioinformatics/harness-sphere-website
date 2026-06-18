# Enviar para um Backend OTLP

Por padrão, o HarnessSphere usa o exportador **stdout**, que imprime cada sinal como uma linha legível direto no seu terminal — perfeito para uma primeira olhada, sem necessidade de infraestrutura. Quando estiver pronto para enviar a um backend real, troque para **OTLP** e envie os sinais para qualquer coletor OpenTelemetry.

## Compilando com o adaptador OTLP

O exportador OTLP fica atrás de uma feature do Cargo, então compile o binário em modo release com a feature `otlp` habilitada:

```bash
cargo build --release --features otlp
```

## Apontando para um coletor

Com o binário compilado com suporte a OTLP, aponte o HarnessSphere para qualquer coletor OpenTelemetry via gRPC. Defina o endpoint e selecione o exportador OTLP através de variáveis de ambiente:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 HARNESSSPHERE_EXPORTER=otlp ./target/release/harnesssphere config.example.toml
```

- `OTEL_EXPORTER_OTLP_ENDPOINT` define o endpoint OTLP/gRPC.
- `HARNESSSPHERE_EXPORTER=otlp` seleciona o exportador ativo.

Prefere manter isso no arquivo de configuração? Você pode definir `exporter = "otlp"` e `otlp_endpoint` diretamente no TOML em vez de usar variáveis de ambiente. Veja [Configuration](/docs/configuration) para a lista completa de chaves e seus valores padrão.

## Quer ver de verdade?

Suba um [SigNoz](https://signoz.io) local e acompanhe os sinais chegando em um dashboard — um único comando:

```bash
docker compose -f deploy/signoz/docker/docker-compose.yaml up -d
```

Isso sobe a interface do SigNoz na porta **:8080** e um endpoint OTLP na porta **:4317** — que é exatamente para onde o endpoint de exemplo acima aponta. Compile com `--features otlp`, execute com o exportador OTLP, e suas métricas de Host e Self devem começar a chegar no SigNoz.

## O que está verificado hoje

O caminho de **métricas** via OTLP/gRPC está confirmado de ponta a ponta contra um OpenTelemetry Collector real. O OTLP para **logs e traces** está no roadmap — hoje o caminho OTLP cobre métricas.

## Próximos passos

- [Connect to the Ecosystem](/docs/connect-ecosystem) — conecte o HarnessSphere aos componentes que enviam dados para ele.
- [Troubleshooting](/docs/troubleshooting) — o que verificar quando os sinais não estão chegando.
