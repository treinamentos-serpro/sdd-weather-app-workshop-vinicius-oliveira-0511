# Backlog de Tarefas — Weather App

Tarefas derivadas de `plans/weather-app-plan.md` e rastreáveis a `specs/weather-app-spec.md`. Cada tarefa é limitada a uma responsabilidade e, em geral, um ou dois arquivos. `src/` e `tests/` não existem no workspace atual; as primeiras tarefas os restauram.

## Ordem de implementação

Os IDs foram preservados para manter a rastreabilidade; a sequência abaixo é a ordem autoritativa de execução. Os detalhes continuam agrupados por entrega funcional nas seções seguintes.

1. **Fundação:** T-01, T-02.
2. **Tipos:** T-05.
3. **Funções puras:** T-06, T-08, T-10.
4. **Services:** T-12, depois T-14 (ambos alteram `weatherService.ts`).
5. **Hook/estado:** T-27.
6. **Componentes:** T-16, T-18, T-19, T-21, T-23, T-25.
7. **Integração:** T-29, depois T-41.
8. **Testes:** T-03, T-04, T-07, T-09, T-11, T-13, T-15, T-17, T-20, T-22, T-24, T-26, T-28, T-30, T-31.
9. **Hardening/release:** T-32 a T-40.

## Prioridade e tamanho

- **P0:** necessário para entregar o fluxo principal ou liberar o produto, incluindo gates legais.
- **P1:** hardening exigido antes de produção, mas não bloqueia a primeira demonstração funcional.
- **P2:** melhoria de confiança/teste que pode vir após a primeira fatia, sem substituir os testes de integração e E2E antes do release.
- **S:** tarefa focada, baixo acoplamento, normalmente um arquivo.
- **M:** vários cenários ou integração de poucas partes.
- **G:** atravessa camadas ou depende de serviço/equipe externa.

| Prioridade | Tamanho | Tarefas |
| --- | --- | --- |
| P0 | S | T-01, T-05, T-06, T-07, T-08, T-10, T-16, T-17, T-18, T-19, T-21, T-22, T-25, T-26 |
| P0 | M | T-02, T-12, T-13, T-14, T-15, T-20, T-23, T-24, T-27, T-28, T-29, T-30, T-31, T-35, T-41 |
| P1 | S | T-03, T-33, T-34, T-38 |
| P1 | M | T-32, T-37, T-39, T-40 |
| P1 | G | T-36 |
| P2 | S | T-04, T-09, T-11 |

## Sequência de fatias verticais

1. **Base executável:** T-01, T-02, T-05. Resultado: shell React compilável com tema e contratos definidos.
2. **Busca → clima atual:** T-06, T-08, T-10, T-12, T-14, T-16, T-18, T-19, T-21, T-27, T-29; antes da validação, T-03; validar com T-13, T-15, T-17, T-20, T-22 e T-28. Resultado: usuário busca/seleciona uma cidade e vê o clima atual, inclusive estados vazio/erro.
3. **Previsão → unidades:** T-23, T-25, T-41; validar com T-24, T-26, T-30 e T-31. Resultado: previsão de cinco dias e alternância Celsius/Fahrenheit no fluxo E2E principal, também em viewport mobile.
4. **Pronto para release:** T-32 a T-40. Resultado: matriz de browsers/viewports, CI, privacidade, conformidade, disponibilidade, desempenho e acessibilidade verificados.

Construir, demonstrar e validar cada fatia antes de iniciar a próxima; o hardening não deve atrasar a primeira demonstração do fluxo principal.

## Entrega 1 — Fundação executável

### T-01 — Restaurar entrada React e App mínimo
- **Descrição:** recriar o ponto de entrada Vite/React e a raiz visual mínima.
- **Critérios de aceite:** `src/main.tsx` monta `App`; `App` renderiza um elemento `<main>`; a tarefa não adiciona chamadas de rede; `pnpm build` passa.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Tipo:** Infra.

### T-02 — Restaurar estilos globais Tailwind
- **Descrição:** restabelecer CSS global e carregamento das diretivas Tailwind com o tema do projeto.
- **Critérios de aceite:** `src/styles/index.css` contém as três diretivas Tailwind (`base`, `components`, `utilities`) e é importado por `src/main.tsx`; o build gera CSS sem erro; o tema mantém o padrão dark glassmorphism definido nas instruções do projeto.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/styles/index.css`, `src/main.tsx`.
- **Tipo:** UI.

### T-03 — Restaurar setup Vitest
- **Descrição:** recriar a configuração de setup esperada pelo `vite.config.ts`.
- **Critérios de aceite:** `tests/setup.ts` importa os matchers Vitest do Testing Library; a execução de um teste que usa `toBeInTheDocument` não falha por matcher ausente.
- **Dependências:** T-01.
- **Arquivos prováveis:** `tests/setup.ts`.
- **Tipo:** Test.

### T-04 — Adicionar teste smoke de App
- **Descrição:** confirmar que a raiz React pode ser renderizada em ambiente jsdom.
- **Critérios de aceite:** teste renderiza `App` em jsdom e encontra `<main>` por `getByRole`; `pnpm test` passa.
- **Dependências:** T-01, T-03, T-29.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.

## Entrega 2 — Modelo e funções puras

### T-05 — Definir contratos meteorológicos
- **Descrição:** declarar tipos de cidade, clima, previsão, unidade, erros e estados discriminados.
- **Critérios de aceite:** `weather.ts` exporta `TemperatureUnit`, `WeatherLocation`, `CitySearchResult`, `CurrentWeather`, `DailyForecast`, `WeatherSnapshot`, `RequestError`, `SearchState` e `WeatherState`; campos opcionais usam `null`; estados usam `status`; `pnpm build` passa em strict mode.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

### T-06 — Implementar conversão de temperatura
- **Descrição:** criar função pura de conversão/formatação Celsius-Fahrenheit.
- **Critérios de aceite:** usa `C * 9 / 5 + 32`; retorna string com uma casa decimal e unidade em pt-BR; recebe Celsius ou Fahrenheit sem mutar o valor de entrada; `null` retorna “Indisponível”.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.

### T-07 — Testar conversão de temperatura
- **Descrição:** criar testes unitários Vitest para conversão, arredondamento, unidades e valor ausente.
- **Critérios de aceite:** asserts exatos para `0 °C → 32,0 °F`, `-40 °C → -40,0 °F`, `20 °C → 20,0 °C` e `null → Indisponível`; nenhum teste usa rede; `pnpm test` passa.
- **Dependências:** T-03, T-06.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.

### T-08 — Implementar formatação de datas
- **Descrição:** formatar datas locais da previsão em pt-BR sem deslocar o dia `YYYY-MM-DD`.
- **Critérios de aceite:** função recebe `YYYY-MM-DD`, fuso IANA e locale pt-BR; para uma fixture em que a data UTC difere da data local, retorna o dia local esperado sem alterar a data de origem.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data.

### T-09 — Testar formatação de datas
- **Descrição:** cobrir datas e fusos sem depender da configuração da máquina.
- **Critérios de aceite:** casos usam fuso IANA fixo, incluindo `America/Los_Angeles` e `Pacific/Auckland`, com asserts de data/label esperados; os resultados são iguais independentemente do fuso configurado no runner; `pnpm test` passa.
- **Dependências:** T-03, T-08.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.
- **Tipo:** Test.

### T-10 — Implementar descrições de códigos WMO
- **Descrição:** mapear códigos meteorológicos para rótulos pt-BR.
- **Critérios de aceite:** códigos conhecidos retornam labels pt-BR não vazios e estáveis; códigos `0` e `61` têm resultados definidos; código desconhecido ou nulo retorna exatamente “Condição indisponível”.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data.

### T-11 — Testar descrições de códigos WMO
- **Descrição:** cobrir códigos conhecidos, desconhecidos e ausentes.
- **Critérios de aceite:** asserts exatos cobrem códigos `0`, `61`, um código desconhecido e `null`; `pnpm test` passa.
- **Dependências:** T-03, T-10.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.

## Entrega 3 — Serviços Open-Meteo

### T-12 — Implementar service de geocoding
- **Descrição:** buscar cidades e mapear resultados para `CitySearchResult`.
- **Critérios de aceite:** a URL contém `count=10`, `language=pt` e consulta codificada via `URLSearchParams`; resultado mapeia `id/name/latitude/longitude/admin1/country/country_code/timezone`; opcional ausente vira `null`; zero resultados vira `empty` e não chama Forecast.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-13 — Testar service de geocoding
- **Descrição:** criar testes unitários Vitest para URL, parsing, limite e ausência de resultados, mockando `fetch`.
- **Critérios de aceite:** fixtures/asserts cobrem sucesso, zero resultados, caracteres `São Paulo` e `L'Haÿ-les-Roses`, limite dez, campos opcionais, HTTP não-2xx e erro de rede; zero resultados não chama Forecast; todos os testes substituem `fetch` e nenhum chama a API real.
- **Dependências:** T-03, T-12, T-14 (mesmo arquivo de teste dos services).
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

### T-14 — Implementar service de forecast
- **Descrição:** consultar clima atual/previsão, validar payload e mapear `WeatherSnapshot`.
- **Critérios de aceite:** request envia coordenadas selecionadas, campos current/daily definidos no plano, Celsius, `timezone=auto` e `forecast_days=5`; mapeia `current.time` e arrays por índice; opcionais ausentes viram `null`; menos de cinco datas vira parcial; timeout dispara em 10 s.
- **Dependências:** T-05, T-12 (mesmo arquivo de service).
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-15 — Testar service de forecast
- **Descrição:** criar testes unitários Vitest de mapeamento e falhas do Forecast, mockando `fetch`.
- **Critérios de aceite:** fixtures/asserts cobrem mapeamento completo, campo opcional ausente, menos de cinco datas, JSON inválido, HTTP não-2xx, erro API, falha de rede e timeout usando relógio falso; todos os testes substituem `fetch`, nenhum chama a API real e `pnpm test` passa.
- **Dependências:** T-13, T-14.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

## Entrega 4 — Componentes de UI

### T-16 — Implementar SearchBar
- **Descrição:** campo e lista de resultados para busca/seleção explícita.
- **Critérios de aceite:** input vazio não chama `onSearch`; cada resultado mostra nome e campos region/country disponíveis; lista aceita no máximo dez itens; seleção por teclado, toque e ponteiro chama `onSelect` uma vez com o resultado correto; componente não importa service.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI.

### T-17 — Testar SearchBar
- **Descrição:** testar busca, validação, resultados e seleção.
- **Critérios de aceite:** asserts cobrem input vazio sem submissão, rótulos geográficos, dez itens no máximo e callback de seleção por teclado; testes usam props simuladas, sem rede; `pnpm test` passa.
- **Dependências:** T-03, T-16.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`.
- **Tipo:** Test.

### T-18 — Implementar LoadingState e EmptyState
- **Descrição:** criar estados visuais de carregamento e ausência de resultados.
- **Critérios de aceite:** LoadingState expõe `role="status"`; EmptyState exibe “Nenhuma cidade encontrada” e oferece callback para editar; ambos têm texto pt-BR e nenhum importa service.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`, `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.

### T-19 — Implementar ErrorState
- **Descrição:** exibir falha e oferecer nova tentativa manual.
- **Critérios de aceite:** erro expõe `role="alert"` e texto pt-BR sem `statusCode`, URL ou corpo bruto; botão “Tentar novamente” chama callback uma vez por ativação e tem nome acessível.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.

### T-20 — Testar componentes de estado
- **Descrição:** criar testes de componentes com Vitest e Testing Library para loading, erro e vazio.
- **Critérios de aceite:** teste de loading encontra LoadingState por `role=status`; teste vazio encontra EmptyState pelo texto “Nenhuma cidade encontrada” e verifica callback de editar; teste de erro encontra ErrorState por `role=alert` e verifica callback de retry uma vez; `pnpm test` passa.
- **Dependências:** T-03, T-18, T-19.
- **Arquivos prováveis:** `tests/unit/states.test.tsx`.
- **Tipo:** Test.

### T-21 — Implementar CurrentWeather
- **Descrição:** apresentar cidade, temperatura, condição e timestamp de referência.
- **Critérios de aceite:** com fixture de 20 °C e condição conhecida renderiza `20,0 °C`; campo nulo renderiza “Indisponível”; timestamp usa “Dados referentes a”; `referenceTime` com mais de 60 min exibe “Dados desatualizados”; código desconhecido exibe “Condição indisponível”.
- **Dependências:** T-05, T-06, T-10.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.

### T-22 — Testar CurrentWeather
- **Descrição:** testar sucesso, campo ausente, código desconhecido e timestamp.
- **Critérios de aceite:** fixtures fixam relógio e cobrem temperatura válida/nula, timestamp ausente/recente/mais antigo que 60 min e código desconhecido; asserts verificam os textos especificados; nenhum teste faz rede.
- **Dependências:** T-03, T-21.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`.
- **Tipo:** Test.

### T-23 — Implementar ForecastCard e ForecastList
- **Descrição:** renderizar itens diários e a lista cronológica da previsão.
- **Critérios de aceite:** cinco itens são renderizados na ordem de entrada; cada item mostra data/condição/mín/máx; nulos mostram “Indisponível”; entrada com menos de cinco datas não cria cartões e mostra “Previsão incompleta”.
- **Dependências:** T-05, T-06, T-08, T-10.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`, `src/components/ForecastList.tsx`.
- **Tipo:** UI.

### T-24 — Testar ForecastCard e ForecastList
- **Descrição:** cobrir lista de cinco dias, ordem e dados parciais.
- **Critérios de aceite:** asserts verificam cinco datas ordenadas, campos nulos, código desconhecido e entrada de quatro dias com aviso e exatamente quatro cartões; `pnpm test` passa.
- **Dependências:** T-03, T-23.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test.

### T-25 — Implementar UnitToggle
- **Descrição:** oferecer seleção entre Celsius e Fahrenheit por props/callback.
- **Critérios de aceite:** controle expõe Celsius/Fahrenheit como opções com rótulos acessíveis; seleção chama callback uma vez com o novo `Unit`; componente não importa service e não recebe permissão para alterar snapshot.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.

### T-26 — Testar UnitToggle
- **Descrição:** verificar semântica e alternância do controle.
- **Critérios de aceite:** por role/label, teste seleciona Fahrenheit, confirma callback `fahrenheit` e estado selecionado; `pnpm test` passa.
- **Dependências:** T-03, T-25.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.

## Entrega 5 — Orquestração e integração

### T-27 — Implementar hook useWeather
- **Descrição:** coordenar geocoding, seleção, forecast, estado, timeout e retry manual.
- **Critérios de aceite:** estados retornados seguem os unions; Forecast não é chamado antes da seleção; busca mais recente vence respostas fora de ordem; timeout de 10 s vira `error.timeout`; retry é manual; abortamento intencional não vira erro visível.
- **Dependências:** T-12, T-14.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data.

### T-28 — Testar hook useWeather
- **Descrição:** validar transições e concorrência isoladas da UI.
- **Critérios de aceite:** testes de transição cobrem `loading/success/empty/partial/error`, retry, timeout e respostas fora de ordem; verificam que só a última cidade selecionada atualiza o snapshot; services são mockados e `pnpm test` passa.
- **Dependências:** T-03, T-27.
- **Arquivos prováveis:** `tests/unit/useWeather.test.tsx`.
- **Tipo:** Test.

### T-29 — Integrar App
- **Descrição:** primeira integração vertical: compor busca, seleção, clima atual e estados da consulta.
- **Critérios de aceite:** buscar e selecionar uma fixture renderiza o clima atual da cidade correta; `loading`, `empty` e `error` chegam aos estados visuais correspondentes; App usa `<main>` e estilos Tailwind; busca e clima atual permanecem utilizáveis em 375 px sem overflow horizontal.
- **Dependências:** T-02, T-06, T-08, T-10, T-12, T-14, T-16, T-18, T-19, T-21, T-27.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.

### T-41 — Integrar previsão de cinco dias e alternância de unidade
- **Descrição:** estender a primeira fatia integrada com previsão diária e controle de unidade.
- **Critérios de aceite:** App exibe cinco dias para a cidade selecionada; campos ausentes e previsão incompleta são apresentados como especificado; todos os valores de temperatura alternam entre Celsius e Fahrenheit sem nova chamada ao service; ao recarregar, a unidade inicia em Celsius.
- **Dependências:** T-23, T-25, T-29.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.

### T-30 — Testar integração de App
- **Descrição:** verificar fluxo integrado e unidade derivada na renderização.
- **Critérios de aceite:** testes integrados cobrem seleção de cidade, dados associados à seleção, estados visuais e unidade; uma contagem de chamadas confirma que alternar unidade não chama service novamente; reload volta a Celsius; `pnpm test` passa.
- **Dependências:** T-03, T-04, T-29, T-41 (mesmo arquivo `App.test.tsx`).
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.

## Entrega 6 — E2E e qualidade de release

### T-31 — Implementar E2E do fluxo principal
- **Descrição:** criar teste Playwright do fluxo completo com fixtures de API interceptadas em desktop e viewport mobile.
- **Critérios de aceite:** busca → seleção → clima atual → cinco datas → alternância passa no viewport desktop e em 375 × 812 px; fixtures são interceptadas por `page.route`; teste falha se qualquer request sair para Open-Meteo; `pnpm test:e2e` passa.
- **Dependências:** T-29, T-30.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

### T-32 — Configurar matriz de browsers e viewports
- **Descrição:** adicionar projetos Playwright e verificação responsiva.
- **Critérios de aceite:** Playwright configura Chromium, Firefox, WebKit desktop, WebKit/iPhone e Chromium/Android; verificação roda nos seis viewports de NFR-02 e falha se `scrollWidth > clientWidth` ou controle principal estiver fora do viewport.
- **Dependências:** T-31.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/responsive.spec.ts`.
- **Tipo:** Test.

### T-33 — Adicionar E2E ao CI
- **Descrição:** instalar browsers Playwright necessários e executar E2E após lint/build/unit.
- **Critérios de aceite:** workflow instala browsers usados pela matriz; executa `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` nessa ordem; qualquer comando diferente de zero falha o job.
- **Dependências:** T-32.
- **Arquivos prováveis:** `.github/workflows/ci.yml`.
- **Tipo:** Infra.

### T-34 — Documentar aviso de privacidade
- **Descrição:** publicar informação sobre o envio da consulta de cidade à Open-Meteo, sem criar histórico ou persistência.
- **Critérios de aceite:** documento publicado em pt-BR declara que a consulta/localidade é enviada à Open-Meteo e que o app não mantém histórico nem persiste a consulta no servidor ou navegador.
- **Dependências:** T-12, T-29.
- **Arquivos prováveis:** `docs/privacy.md` ou página equivalente aprovada para publicação.
- **Tipo:** Infra.

### T-35 — Aprovar termos e atribuição Open-Meteo
- **Descrição:** obter confirmação responsável de uso comercial, limites e atribuição necessária.
- **Critérios de aceite:** aprovação de uso comercial, limites e atribuição está registrada no checklist de release; se houver atribuição exigida, teste/revisão confirma que o texto aprovado aparece no produto; sem evidência de aprovação o gate permanece falho.
- **Dependências:** T-12; gate de release.
- **Arquivos prováveis:** registro de aprovação no checklist de release; arquivo ainda a definir.
- **Tipo:** Infra.

### T-36 — Configurar monitoramento de disponibilidade
- **Descrição:** monitorar disponibilidade HTTPS do shell e erros/indisponibilidade de dados Open-Meteo separadamente.
- **Critérios de aceite:** sondas HTTPS válidas executam a cada minuto em dois locais; dashboard apresenta métricas separadas para shell e falha da Open-Meteo; documento nomeia canal de alerta e responsável; URL do dashboard/configuração é registrada.
- **Dependências:** T-29, T-33 e seleção do host/serviço de monitoramento.
- **Arquivos prováveis:** `docs/operations.md` e configuração no provedor de monitoramento (a definir).
- **Tipo:** Infra.

### T-37 — Verificar meta de desempenho
- **Descrição:** executar medição reproduzível da resposta local e das consultas meteorológicas.
- **Critérios de aceite:** em viewport 375 px e rede configurada para 10 Mbps/100 ms RTT, feedback local aparece em até 200 ms; em 20 consultas, pelo menos 19 renderizam dados válidos em até 5 s; relatório separa tempo do app e latência da API.
- **Dependências:** T-31, T-32.
- **Arquivos prováveis:** `tests/e2e/weather.performance.spec.ts`.
- **Tipo:** Test.

### T-38 — Adicionar verificador automatizado de acessibilidade
- **Descrição:** adicionar integração Playwright/axe para testar a interface renderizada.
- **Critérios de aceite:** `@axe-core/playwright` está em `devDependencies`; `pnpm install --frozen-lockfile` termina com sucesso.
- **Dependências:** T-32.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Tipo:** Test.

### T-39 — Automatizar varredura de acessibilidade
- **Descrição:** executar axe nos principais estados e fluxos da aplicação.
- **Critérios de aceite:** varreduras cobrem busca inicial, resultados, clima carregado, vazio, parcial e erro; Playwright falha com qualquer violação axe de severidade critical ou serious; `pnpm test:e2e` passa.
- **Dependências:** T-29, T-38.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.
- **Tipo:** Test.

### T-40 — Registrar auditoria manual de acessibilidade
- **Descrição:** validar os fluxos principais por teclado e leitor de tela e registrar os resultados.
- **Critérios de aceite:** checklist registra ambiente/navegador e resultado para busca, seleção, alternância, loading, vazio e erro; todos os controles são alcançáveis e operáveis por teclado sem armadilha de foco; mensagens de estado são anunciadas no leitor de tela usado; falhas ficam registradas com responsável e status.
- **Dependências:** T-39.
- **Arquivos prováveis:** `docs/accessibility-checklist.md`.
- **Tipo:** Test.

## Gates de conclusão

- Cada tarefa satisfaz seus próprios critérios e requisitos relacionados na matriz abaixo.
- Tarefas de `src/` ou `tests/` passam por `pnpm lint`, `pnpm build` e `pnpm test`; tarefas E2E também passam por `pnpm test:e2e`.
- Publicação depende de T-34, T-35 e T-36; desempenho e acessibilidade devem passar em T-37 a T-40; gates da spec não podem permanecer pendentes.

## Matriz de rastreabilidade

| Tarefa | Requisito(s) relacionado(s) |
| --- | --- |
| T-01 | Fundação técnica; sem FR direto |
| T-02 | Instrução do projeto: React/Vite, Tailwind e dark glassmorphism |
| T-03 | Fundação de testes; sem FR direto |
| T-04 | Fundação de testes; sem FR direto |
| T-05 | FR-01 a FR-07 (contratos compartilhados) |
| T-06 | FR-05 |
| T-07 | FR-05 |
| T-08 | FR-04, FR-06, NFR-01 |
| T-09 | FR-04, FR-06, NFR-01 |
| T-10 | FR-03, FR-04, NFR-01 |
| T-11 | FR-03, FR-04 |
| T-12 | FR-01, FR-02, NFR-09 |
| T-13 | FR-01, FR-02, NFR-09 |
| T-14 | FR-03, FR-04, FR-06, FR-07 |
| T-15 | FR-03, FR-04, FR-06, FR-07 |
| T-16 | FR-01, FR-02, NFR-03 |
| T-17 | FR-01, FR-02, NFR-03 |
| T-18 | FR-07, NFR-01, NFR-03 |
| T-19 | FR-07, NFR-01, NFR-03 |
| T-20 | FR-07, NFR-03 |
| T-21 | FR-03, FR-06, NFR-01, NFR-06 |
| T-22 | FR-03, FR-06, NFR-06 |
| T-23 | FR-04, NFR-01 |
| T-24 | FR-04 |
| T-25 | FR-05 |
| T-26 | FR-05 |
| T-27 | FR-01 a FR-07 |
| T-28 | FR-01 a FR-07 |
| T-29 | FR-01 a FR-07, NFR-01, NFR-02 |
| T-30 | FR-01 a FR-07, NFR-02 |
| T-31 | FR-01 a FR-07 |
| T-32 | NFR-02, NFR-08 |
| T-33 | NFR-08; gates do projeto |
| T-34 | NFR-07 |
| T-35 | NFR-10 |
| T-36 | NFR-05, NFR-09 |
| T-37 | NFR-04 |
| T-38 | NFR-03 (ferramenta de verificação) |
| T-39 | NFR-03 |
| T-40 | NFR-03 |
| T-41 | FR-04, FR-05 |

## Rastreabilidade de requisitos funcionais

| Requisito da spec | Tarefas de implementação | Tarefas de teste | Cobertura |
| --- | --- | --- | --- |
| FR-01 — Buscar cidades | T-12, T-16, T-27, T-29 | T-13, T-17, T-28, T-30, T-31 | Coberto |
| FR-02 — Selecionar cidade | T-12, T-16, T-27, T-29 | T-13, T-17, T-28, T-30, T-31 | Coberto |
| FR-03 — Consultar clima atual | T-14, T-21, T-29 | T-15, T-22, T-30, T-31 | Coberto |
| FR-04 — Consultar previsão de cinco dias | T-14, T-23, T-41 | T-15, T-24, T-30, T-31 | Coberto |
| FR-05 — Alternar unidade | T-06, T-25, T-41 | T-07, T-26, T-30, T-31 | Coberto |
| FR-06 — Informar horário de referência | T-14, T-21, T-29 | T-15, T-22, T-31 | Coberto |
| FR-07 — Comunicar estados da consulta | T-14, T-18, T-19, T-27, T-29 | T-15, T-20, T-28, T-31 | Coberto |

**Lacunas:** nenhum requisito funcional da spec está sem tarefa de implementação ou teste correspondente.
