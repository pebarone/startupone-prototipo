Plan: Locker Grid Dinâmico e Animado
Trocar a lista atual por uma visualização de lockers em grade, com montagem automática pela quantidade, estados por cor (verde disponível, vermelho ocupado, laranja manutenção), animações de abrir/fechar nos 3 momentos que você definiu (clique preview, abrir, fechar), atualização automática por polling e aplicação em fluxo público, retirada e partner.

Steps

Fase 1 — Base de dados de UI e regras visuais (bloqueia as demais)
Padronizar no frontend o modelo de locker exibível por grade, unificando status, rótulos e cores da nova experiência.
Criar utilitário de carregamento de lockers por local via endpoint público de lockers com filtros por local e organização; incluir controle de loading, erro e cancelamento de request.
Definir ciclo de polling de 10-15s com start/stop por tela ativa para evitar chamadas duplicadas e vazamento de intervalo.
Fase 2 — Componente visual reutilizável (depends on 1-4)
Criar componente compartilhado de grade de lockers (responsivo), com props para lockers, seleção, modo de uso (público/retirada/admin), e eventos de clique.
Implementar visual do locker (porta/puxador), estados e animações de abertura/fechamento com fallback para redução de movimento.
Garantir acessibilidade do grid: navegação por teclado, foco visível, labels por locker e bloqueio de ação em lockers não disponíveis.
Fase 3 — Integração no aluguel público (depends on 5-8)
Substituir a lista lateral da etapa de escolha por grade visual dinâmica.
Manter o mapa e seleção de local, mas carregar todos os lockers do local para exibir os 3 status (não só livres).
Regras de interação: disponível seleciona para aluguel; ocupado/manutenção apenas informam indisponibilidade sem avançar fluxo.
Aplicar animação de abrir ao entrar na etapa de abertura e animação de fechar após confirmação de início de armazenagem.
Fase 4 — Integração em retirada (depends on 5-8, parallel with fase 5)
Em entrada de retirada, adicionar consulta visual por local com grade read-only para contexto de ocupação.
Em retirada detalhada, exibir contexto visual compacto do locker/local sem permitir iniciar novo aluguel.
Fase 5 — Integração partner (depends on 5-8, parallel with fase 4)
Incorporar a grade visual na tela de lockers mantendo filtros/ações existentes.
Ajustar preview de status no dashboard partner para versão visual consistente com a nova legenda.
Fase 6 — Ajustes finais e robustez (depends on fases 3-5)
Harmonizar comportamento de loading/erro/empty state nas três jornadas.
Revisar performance para locais com muitos lockers e minimizar re-render em polling.
Fechar consistência de cores e feedback visual entre público, retirada e partner.
Relevant files

UseView.vue — troca da lista por grade, integração de status completos por local, animações de abrir/fechar no fluxo.
RetrieveEntryView.vue — consulta visual read-only por local na jornada de retirada.
RetrieveView.vue — contexto visual do locker/local durante autenticação e finalização.
PartnerLockersView.vue — visualização em grade mantendo filtros e ações administrativas.
PartnerDashboardView.vue — preview visual de status de lockers.
LockerMap.vue — manter sincronia com seleção de local e legenda de estado.
useApi.js — base para novos fetches e polling.
style.css — tokens/efeitos globais compartilhados da nova visualização.
Verification

Rodar npm run build em frontend e confirmar build sem erro.
Fluxo público: selecionar local, visualizar lockers dos 3 status, clicar disponível, concluir até abrir e fechar com animações corretas.
Fluxo retirada: confirmar grade de consulta por local, sem ação indevida de aluguel, e continuidade normal de biometria/pagamento.
Fluxo partner: validar grade visual com filtros e ações já existentes.
Conferir mapeamento de cores em todas as telas: verde disponível, vermelho ocupado, laranja manutenção.
Validar polling (10-15s) com atualização de status visível sem recarregar página.
Testar responsividade em mobile e desktop, sem overflow e com boa área de toque.
Decisions

Escopo confirmado: fluxo público (/use e /locker/:lockerId), retirada e partner.
Cores confirmadas: verde disponível, vermelho ocupado, laranja manutenção.
Animação confirmada em três momentos: clique preview, abrir, fechar.
Atualização automática confirmada com polling de 10-15s.
Sem mudança de backend nesta etapa; usar endpoints existentes.
