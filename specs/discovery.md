# Análise de Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários possam consultar as condições meteorológicas de cidades. A experiência deve incluir busca de cidades, visualização do clima atual e previsão para hoje e os quatro dias seguintes, escolha entre Celsius e Fahrenheit e suporte ao uso em dispositivos móveis.

O briefing descreve o objetivo e as capacidades principais, mas ainda não define detalhes de interação, fontes de dados, localização das cidades, conteúdo da previsão ou critérios de qualidade mensuráveis. Esses pontos devem ser esclarecidos antes da especificação detalhada e do planejamento técnico.

## Decisões

- **Fonte de dados — Open-Meteo, sem API key.** A escolha atende à necessidade de dados meteorológicos sem exigir uma chave de API para o app. Resolve a pergunta sobre qual fonte será usada; cobertura, frequência de atualização e termos aplicáveis ainda precisam ser verificados.
- **Horizonte da previsão — hoje + 4 dias.** A previsão cobrirá cinco dias consecutivos, começando por hoje. Resolve a ambiguidade sobre a composição dos cinco dias; a regra de fuso horário e a apresentação diária ou intradiária continuam em aberto.
- **Unidade padrão — Celsius.** Temperaturas serão exibidas inicialmente em Celsius, mantendo a opção de alternar para Fahrenheit. Resolve qual unidade usar por padrão; a persistência da preferência continua em aberto.
- **Acesso e armazenamento — sem autenticação e sem persistência de servidor.** O app não terá contas de usuário nem armazenará dados de usuário no servidor. Isso limita o escopo e evita exigir cadastro; não define se preferências serão mantidas localmente no dispositivo.
- **Idioma da interface — pt-BR.** Textos e interface serão apresentados em português do Brasil. Resolve o idioma inicial do produto; suporte a outros idiomas não está incluído nesta decisão.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário procure uma cidade pelo nome.
- **RF-02 — Consultar clima atual:** apresentar as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** apresentar a previsão do tempo para hoje e os quatro dias seguintes para a cidade selecionada.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit na exibição das temperaturas.
- **RF-05 — Informar atualização dos dados:** apresentar quando as informações meteorológicas exibidas foram atualizadas, quando esse dado estiver disponível na fonte.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve suportar larguras de tela de 320 px a 1920 px, sem rolagem horizontal, mantendo busca, clima atual e previsão utilizáveis.
- **RNF-02 — Usabilidade:** as tarefas principais (buscar uma cidade, consultar seus dados e alternar unidades) devem poder ser concluídas sem instruções externas. A validação com usuários e os critérios de sucesso ainda precisam ser definidos.
- **RNF-03 — Acessibilidade:** a interface deve atender ao nível WCAG 2.2 AA, incluindo navegação por teclado, foco visível, nomes acessíveis para controles e contraste adequado.
- **RNF-04 — Desempenho:** em condições de rede a serem definidas, 95% das buscas e consultas devem exibir resultado ou estado de carregamento em até 2 segundos e concluir a consulta em até 3 segundos.
- **RNF-05 — Disponibilidade:** a aplicação deve alcançar disponibilidade mensal de 99,5%. A indisponibilidade da fonte meteorológica externa deve ser monitorada separadamente; quando ela falhar, a aplicação deve continuar apresentando uma interface utilizável.
- **RNF-06 — Atualidade dos dados:** a idade máxima aceitável dos dados meteorológicos deve ser definida conforme a fonte escolhida. Dados que ultrapassem esse limite não devem ser apresentados como atuais.
- **RNF-07 — Compatibilidade:** navegadores e versões mínimas suportados, em dispositivos móveis e desktop, devem ser definidos e cobertos pela estratégia de testes.

## Riscos

- **Ambiguidade na busca:** nomes de cidades podem ser repetidos ou escritos de formas diferentes, levando à seleção de uma localidade incorreta.
- **Dependência de dados externos:** indisponibilidade, lentidão, limites de uso ou mudanças na fonte de dados podem impedir ou atrasar consultas.
- **Fuso horário da previsão:** sem definir o fuso usado para delimitar cada dia, a previsão pode ser agrupada de forma inesperada para cidades distantes.
- **Dados desatualizados ou incompletos:** a fonte pode não fornecer dados para todas as localidades ou pode atualizar informações com atraso.
- **Conectividade móvel variável:** redes lentas ou instáveis podem prejudicar a experiência durante a busca e a consulta.
- **Conversão e consistência de unidades:** alternar entre Celsius e Fahrenheit pode gerar valores inconsistentes se nem todas as temperaturas exibidas forem convertidas.
- **Escopo de acessibilidade indefinido:** sem critérios explícitos, requisitos importantes de navegação por teclado, leitores de tela e contraste podem ser omitidos.

## Perguntas em Aberto

1. A busca deve aceitar apenas nomes de cidades ou também países, regiões e códigos postais?
2. Como resultados com nomes iguais devem ser diferenciados (por país, região ou outro dado)?
3. O usuário seleciona uma cidade em uma lista de resultados ou a aplicação abre automaticamente o primeiro resultado?
4. Quais informações devem compor o clima atual e cada dia da previsão (por exemplo, temperatura mínima e máxima, condição, precipitação, vento ou umidade)?
5. A previsão deve ser apresentada por dia ou incluir períodos intradiários?
6. Quais são os limites, a cobertura, a frequência de atualização e os termos aplicáveis à Open-Meteo para o uso previsto?
7. A unidade escolhida deve permanecer apenas durante a sessão ou ser lembrada entre visitas no próprio dispositivo?
8. A aplicação deve usar a localização do dispositivo ou mostrar apenas cidades pesquisadas manualmente?
9. Como a interface deve se comportar quando não houver resultados, a consulta falhar ou a conexão estiver indisponível?
10. Há requisitos específicos de fuso horário ou formato local de data e hora além do idioma pt-BR?
11. As metas iniciais de desempenho (2 segundos para resposta ou estado de carregamento e 3 segundos para conclusão) são adequadas às condições de rede esperadas?
12. A meta de disponibilidade de 99,5% ao mês é adequada? Como indisponibilidades da fonte externa devem ser comunicadas e contabilizadas?
13. Quais navegadores e versões mínimas devem ser suportados?
14. Qual idade máxima dos dados ainda é aceitável para exibi-los como atuais?

## Suposições

- A aplicação será acessada por uma interface web, pois o briefing menciona uso em dispositivos móveis, mas não solicita um aplicativo nativo.
- A busca é feita pelo usuário e não depende de acesso automático à localização do dispositivo.
- O usuário deve escolher explicitamente uma cidade quando a busca puder retornar mais de uma correspondência.
- A alternância entre Celsius e Fahrenheit afeta a apresentação das temperaturas, sem alterar os dados meteorológicos de origem.
- A previsão de cinco dias será associada à cidade selecionada.
- A aplicação usará Open-Meteo como fonte meteorológica, conforme a decisão registrada; detalhes de cobertura e atualização ainda precisam ser confirmados.
- Não haverá autenticação nem persistência de dados no servidor; eventual persistência local de preferências ainda precisa ser decidida.
- A interface será em pt-BR, conforme a decisão registrada.
- As metas de desempenho e disponibilidade registradas são propostas iniciais e precisam ser validadas com as partes interessadas e com os limites da fonte de dados escolhida.
- Conteúdo detalhado da previsão, persistência local de preferências e tratamento específico de falhas permanecem fora das decisões confirmadas até que as perguntas em aberto sejam respondidas.
