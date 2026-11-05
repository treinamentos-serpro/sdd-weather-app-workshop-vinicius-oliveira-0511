# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação web responsiva que permite pesquisar e selecionar uma cidade, consultar seu clima atual e ver uma previsão diária para hoje e os quatro dias seguintes. O público inclui pessoas que consultam o clima para deslocamentos, planejamento de viagens e trabalho ao ar livre.

A interface e as mensagens serão em pt-BR. A fonte será Open-Meteo, sem API key. Celsius é a unidade inicial, com alternância para Fahrenheit. O produto não terá autenticação, localização automática nem persistência de dados no servidor. As regras e metas abaixo constituem a baseline de aceitação do MVP; alterações exigem revisão desta especificação.

## Functional Requirements

- **FR-01 — Buscar cidades:** aceitar uma consulta com ao menos um caractere não branco após remover espaços nas extremidades; preservar letras acentuadas e pontuação válida em nomes; exibir no máximo dez resultados na ordem recebida da geocodificação. Consulta vazia não deve ser enviada.
- **FR-02 — Selecionar cidade:** exigir seleção explícita de um resultado antes de consultar o clima. Cada resultado deve mostrar nome e, quando disponíveis, região administrativa e país. Usar a identidade geográfica do resultado selecionado nas consultas seguintes.
- **FR-03 — Consultar clima atual:** exibir nome da cidade selecionada, temperatura atual e condição meteorológica correspondente. Campo ausente deve ser apresentado como “Indisponível”, sem inventar valor ou impedir a exibição dos demais campos válidos.
- **FR-04 — Consultar previsão:** exibir cinco datas consecutivas, começando pela data atual no fuso horário da cidade selecionada. Para cada data, exibir condição e temperaturas mínima/máxima; campo ausente deve ser apresentado como “Indisponível”.
- **FR-05 — Alternar unidade de temperatura:** oferecer Celsius e Fahrenheit, iniciando em Celsius em cada carregamento completo da aplicação. Converter todos os valores de temperatura exibidos usando $F = C \times 9/5 + 32$ e apresentar uma casa decimal. A preferência vale enquanto a página estiver aberta e não é persistida.
- **FR-06 — Informar horário de referência:** exibir o timestamp de referência dos dados fornecido pela fonte, convertido para o horário local da cidade e identificado pelo rótulo “Dados referentes a”. Se a fonte não fornecer esse timestamp, omiti-lo; nunca substituí-lo pelo horário em que a requisição foi feita.
- **FR-07 — Comunicar estados da consulta:** apresentar estados distintos de carregamento, sem resultados, erro e resposta parcial. Solicitações sem resposta em dez segundos devem terminar em erro de timeout. Erros devem oferecer tentativa manual; não deve haver repetição automática.

## User Stories

- **US-01 (FR-01, FR-02):** Como Marina, pessoa que se desloca diariamente, quero buscar e selecionar minha cidade para consultar a localidade correta antes de sair.
- **US-02 (FR-03):** Como Marina, pessoa que se desloca diariamente, quero ver o clima atual da cidade selecionada para me preparar para o trajeto.
- **US-03 (FR-04):** Como Rafael, pessoa que planeja uma viagem, quero consultar a previsão de hoje e dos quatro dias seguintes no destino para organizar minhas atividades e o que levar.
- **US-04 (FR-05):** Como Rafael, pessoa que planeja uma viagem, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-05 (FR-06):** Como Joana, profissional que trabalha ao ar livre, quero ver o horário associado aos dados meteorológicos para avaliar se são recentes.
- **US-06 (FR-07):** Como Joana, profissional que trabalha ao ar livre, quero receber uma indicação clara quando a consulta falhar e poder tentar novamente para saber se posso confiar nos dados exibidos.

## Acceptance Criteria

- **AC-01.1 (FR-01):** **Given** um campo com “São Paulo” e uma resposta de geocodificação com mais de dez itens, **When** a busca é enviada, **Then** são apresentados no máximo dez itens na ordem da resposta.
- **AC-01.2 (FR-01):** **Given** um campo vazio ou contendo somente espaços, **When** o usuário envia a busca, **Then** nenhuma requisição de geocodificação é feita e uma mensagem de validação é exibida.
- **AC-01.3 (FR-01):** **Given** uma consulta com espaços externos e caracteres acentuados ou pontuação válida, **When** a busca é enviada, **Then** espaços externos são removidos e o nome permanece corretamente codificado na requisição.
- **AC-02.1 (FR-02):** **Given** resultados de geocodificação, **When** a lista é exibida, **Then** cada item mostra nome e os campos de região e país disponíveis, e nenhum item é selecionado automaticamente.
- **AC-02.2 (FR-02):** **Given** um item de cidade selecionado por teclado, toque ou ponteiro, **When** a seleção é confirmada, **Then** a consulta meteorológica usa as coordenadas daquele item e o cabeçalho identifica a cidade escolhida.
- **AC-03.1 (FR-03):** **Given** uma resposta atual com temperatura 20 °C e condição conhecida, **When** os dados são exibidos no primeiro carregamento, **Then** aparecem o nome da cidade, “20,0 °C” e a descrição da condição em pt-BR.
- **AC-03.2 (FR-03):** **Given** temperatura ausente e condição válida, **When** o clima atual é exibido, **Then** a temperatura aparece como “Indisponível” e a condição válida continua visível; nenhum valor zero é criado.
- **AC-04.1 (FR-04):** **Given** uma cidade cuja data local é 2026-06-10 e cinco registros diários válidos, **When** a previsão é exibida, **Then** aparecem as datas de 10 a 14 de junho na ordem, com condição, mínima e máxima de cada registro disponível.
- **AC-04.2 (FR-04):** **Given** um registro diário sem temperatura máxima, **When** o cartão daquele dia é exibido, **Then** a máxima aparece como “Indisponível” e os demais dados válidos do cartão permanecem visíveis.
- **AC-04.3 (FR-04):** **Given** que a fonte retorna menos de cinco datas, **When** a previsão é exibida, **Then** o app não inventa datas ou valores e informa que a previsão está incompleta.
- **AC-05.1 (FR-05):** **Given** temperatura de 0,0 °C exibida, **When** o usuário seleciona Fahrenheit, **Then** o valor passa a “32,0 °F”; para -40,0 °C, o resultado é “-40,0 °F”.
- **AC-05.2 (FR-05):** **Given** temperaturas atuais e previstas carregadas, **When** o usuário alterna a unidade, **Then** todos os valores visíveis são convertidos sem nova requisição meteorológica; ao recarregar a página, a unidade volta a Celsius.
- **AC-06.1 (FR-06):** **Given** timestamp de referência e fuso da cidade na resposta, **When** o clima atual é exibido, **Then** o horário convertido para a localidade aparece com o rótulo “Dados referentes a”.
- **AC-06.2 (FR-06):** **Given** que a resposta não contém timestamp de referência, **When** o clima é exibido, **Then** “Dados referentes a” não aparece e o horário da requisição não é usado como substituto.
- **AC-07.1 (FR-07):** **Given** uma busca ou consulta ainda pendente, **When** passam 200 ms sem resposta, **Then** o estado de carregamento já está visível.
- **AC-07.2 (FR-01, FR-07):** **Given** geocodificação concluída com zero resultados, **When** a resposta é apresentada, **Then** o app informa “Nenhuma cidade encontrada”, oferece editar a consulta e não solicita previsão meteorológica.
- **AC-07.3 (FR-07):** **Given** uma solicitação pendente, **When** ela permanece sem resposta por dez segundos, **Then** o app encerra o carregamento, informa timeout e oferece uma tentativa manual.
- **AC-07.4 (FR-07):** **Given** erro HTTP, falha de rede ou JSON inválido, **When** a resposta é processada, **Then** o app apresenta mensagem de erro e ação de nova tentativa, sem exibir a falha como dado válido.
- **AC-07.5 (FR-07):** **Given** que a tentativa anterior falhou e uma nova tentativa retorna dados válidos, **When** a resposta termina de carregar, **Then** o estado de erro é substituído pelos dados da cidade selecionada.
- **AC-07.6 (FR-01, FR-07):** **Given** duas buscas consecutivas que terminam fora de ordem, **When** ambas recebem resposta, **Then** somente os resultados da busca mais recente permanecem visíveis.

## Non-Functional Requirements

- **NFR-01 — Idioma e formatos:** interface, erros, datas e unidades devem usar pt-BR; datas e horas devem ser formatadas para a localidade consultada.
- **NFR-02 — Responsividade:** em larguras de 320, 375, 768, 1024, 1440 e 1920 px, busca, clima atual e previsão devem permanecer utilizáveis, sem rolagem horizontal nem conteúdo ou controle cortado.
- **NFR-03 — Acessibilidade:** atender WCAG 2.2 AA. Todos os fluxos devem ser completáveis por teclado; foco visível; campos, botões e resultados com nomes acessíveis; atualizações de estado anunciadas por tecnologia assistiva; contraste conforme WCAG. Validar com verificador automatizado e revisão manual de teclado/leitor de tela.
- **NFR-04 — Desempenho:** em viewport móvel de 375 px, rede de teste de 10 Mbps e RTT de 100 ms, feedback visual local deve ocorrer em até 200 ms e 95% das consultas bem-sucedidas devem renderizar os dados em até 5 s, medidos do envio ao conteúdo utilizável. Executar vinte consultas em ambiente de teste; monitoramento de produção deve reportar p50/p95 separadamente da latência da Open-Meteo.
- **NFR-05 — Disponibilidade:** disponibilidade mensal do shell da aplicação de pelo menos 99,5%, medida por verificações HTTPS a cada minuto de dois locais externos. Falhas da Open-Meteo não contam como indisponibilidade do shell, mas devem ser monitoradas como disponibilidade de dados separada.
- **NFR-06 — Atualidade:** uma observação atual com mais de 60 minutos em relação ao horário de referência não pode ser rotulada como atual; deve ser identificada como desatualizada. Previsão incompleta deve seguir AC-04.3.
- **NFR-07 — Privacidade e armazenamento:** não exigir conta, não persistir consultas, localização ou preferência no servidor e não armazenar a última cidade/unidade no navegador. A cidade pesquisada será enviada à Open-Meteo; a política de privacidade deve informar essa transferência.
- **NFR-08 — Compatibilidade:** suportar as duas versões principais mais recentes de Chrome, Edge, Firefox e Safari em desktop, Safari em iOS e Chrome em Android, na data de cada release. Testar os fluxos principais nessa matriz.
- **NFR-09 — Segurança de transporte e entrada:** servir a aplicação por HTTPS; tratar texto de busca como dado, não como conteúdo executável; não incluir segredos ou credenciais privadas no cliente.
- **NFR-10 — Condições de uso da fonte:** antes da publicação, confirmar e cumprir termos, limites, atribuição e permissão de uso comercial da Open-Meteo. A publicação é bloqueada até essa confirmação.

## Edge Cases

- Busca vazia: nenhuma chamada; exibir validação. Busca sem resultados: exibir estado vazio e permitir editar o termo.
- Nome com acentos, hífen ou apóstrofo: preservar e codificar corretamente; não aceitar entrada composta só por espaços ou caracteres de controle.
- Cidade inexistente ou fora da cobertura: tratar como busca sem resultados, sem consultar a previsão.
- Cidades homônimas: mostrar os campos geográficos disponíveis e exigir seleção explícita.
- Resposta parcial: mostrar os campos válidos e “Indisponível” para os ausentes; nunca usar zero como substituto. Menos de cinco datas aciona aviso de previsão incompleta.
- Resposta HTTP de erro, falha de rede ou JSON inválido: aplicar AC-07.4; timeout em dez segundos conforme AC-07.3.
- Duas buscas simultâneas concluídas fora de ordem: somente a busca mais recente pode atualizar a lista.
- Temperatura negativa, decimal ou próxima do ponto de arredondamento: aplicar a conversão e uma casa decimal definidas em FR-05.
- Timestamp ausente: omitir “Dados referentes a”; timestamp presente: mostrar horário local da cidade.
- Dados atuais com mais de 60 minutos: identificá-los como desatualizados, nunca como atuais.
- Viewport estreito, teclado virtual ou ampliação: controles e conteúdo continuam visíveis e operáveis sem sobreposição.

## Assumptions

- A aplicação é web responsiva; não há app nativo no MVP.
- As buscas são manuais e não solicitam GPS nem localização por IP.
- A geocodificação fornece campos de localidade e a API meteorológica fornece coordenadas, fuso, dados atuais e dados diários ou indica campos ausentes.
- O fuso retornado para a cidade selecionada determina datas, horários e o significado de “hoje”.
- Condição atual e condição diária são apresentadas em texto pt-BR a partir dos códigos meteorológicos da fonte; códigos desconhecidos são exibidos como “Condição indisponível”.
- A unidade é mantida apenas enquanto a página está aberta; recarregar inicia em Celsius.
- Timeout, frescor, desempenho, disponibilidade e navegadores seguem os valores e métodos definidos nos NFRs.
- Termos e atribuição da fonte são uma condição de lançamento, não uma suposição de conformidade já verificada.

## Risks

- **Falha ou limitação da Open-Meteo:** pode interromper ou degradar dados; mitigar com timeout definido, nova tentativa manual, estados claros e monitoramento separado da disponibilidade do shell.
- **Termos comerciais/atribuição:** uso não autorizado pode bloquear lançamento; mitigar com validação formal antes de publicar.
- **Resultados de cidade ambíguos ou cobertura incompleta:** podem levar a consulta errada ou incompleta; mitigar com seleção explícita, contexto geográfico e apresentação de campos ausentes.
- **Dados atrasados:** podem induzir decisões com informação obsoleta; mitigar com limite de 60 minutos e rótulo explícito de desatualização.
- **Metas de desempenho e disponibilidade:** a dependência de rede e provedor pode degradar o serviço; medir a aplicação e a fonte separadamente e revisar metas com dados de produção.
- **Privacidade da busca:** a localidade pesquisada é enviada ao provedor; mitigar com aviso de privacidade claro e não persistir histórico no produto.

## Out of Scope

- Autenticação, contas de usuário e dados persistidos no servidor.
- Aplicativo nativo para iOS ou Android.
- Localização automática por GPS ou endereço IP.
- Favoritos, histórico de buscas ou sincronização entre dispositivos.
- Alertas, notificações push ou avisos meteorológicos proativos.
- Idiomas além de pt-BR.
- Dados históricos e comparação de períodos passados.
- Previsão horária.
- GPS, localização por IP, favoritos, histórico, alertas, notificações push e contas.
- Persistência local ou sincronização entre visitas/dispositivos.
- Idiomas diferentes de pt-BR e dados meteorológicos históricos.

## Open Questions

1. A empresa confirma que os termos e a atribuição da Open-Meteo permitem o uso comercial pretendido? **Gate de lançamento.**
2. A empresa aprova as metas de produto propostas (timeout de 10 s, dados atuais válidos por até 60 min, p95 de consulta de 5 s e disponibilidade mensal do shell de 99,5%)?
3. A empresa aprova como escopo do MVP temperatura/condição atual e condição/mínima/máxima diária, sem previsão horária?
