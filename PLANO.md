# Plano de Desenvolvimento do MVP - Lockers Digitais

## 1. Objetivo

Construir um MVP funcional para demonstrar que e possivel controlar o acesso a lockers de forma digital, escalavel e integrada a parceiros.

O sistema deve permitir que um usuario escolha um locker disponivel, realize um pagamento simulado, receba um codigo unico de acesso, abra o locker por meio desse codigo e permita que o parceiro acompanhe o status e metricas simples no dashboard.

O nome da startup será FastLock.

## 2. Escopo do MVP

### Dentro do escopo

- Landing page com apresentacao da solucao.
- Fluxo de uso do usuario.
- Dashboard simples para parceiro.
- Cadastro e atualizacao de lockers.
- Criacao de alugueis.
- Geracao de codigo unico.
- Validacao de codigo para abertura do locker.
- Atualizacao de status do locker.
- Simulacao de pagamento.
- Simulacao de abertura do locker.
- Metricas basicas no dashboard.

### Fora do escopo

- Pagamento real.
- Autenticacao completa.
- Integracao com hardware real.
- Integracao com seguro.
- Sistema completo de usuarios e permissoes.

## 3. Arquitetura Proposta

### Frontend

Stack sugerida:

- Vue.js + Vite.
- Vue router para a navegação
- Tailwind
- Biblioteca simples para QR Code

Paginas:

- `/`: landing page.
- `/use`: fluxo do usuario.
- `/partner`: dashboard do parceiro.

O projeto deve conter uma landing page. 

### Backend

Stack sugerida:

- API REST em Node.js.

- Banco postgres via supabase

Recursos principais:

- Lockers.
- Rentals.
- Unlock.
- Dashboard.

## 4. Modelo de Dados

### Lockers

Campos:

- `id`: identificador unico.
- `size`: tamanho do locker. Valores esperados: `P`, `M`, `G`.
- `status`: estado atual. Valores esperados: `free`, `occupied`.

Exemplo:

```json
{
  "id": "locker-001",
  "size": "M",
  "status": "free"
}
```

### Rentals

Campos:

- `id`: identificador unico.
- `locker_id`: locker associado ao aluguel.
- `code`: codigo unico de acesso.
- `start_time`: data e hora de inicio.
- `end_time`: data e hora de fim, quando finalizado.
- `status`: estado atual. Valores esperados: `active`, `finished`.

Exemplo:

```json
{
  "id": "rental-001",
  "locker_id": "locker-001",
  "code": "839204",
  "start_time": "2026-04-09T10:00:00.000Z",
  "end_time": null,
  "status": "active"
}
```

## 5. API REST

### Lockers

#### `GET /lockers`

Lista todos os lockers.

Uso no MVP:

- Exibir lockers disponiveis no fluxo do usuario.
- Exibir status no dashboard do parceiro.

#### `POST /lockers`

Cria um novo locker.

Payload sugerido:

```json
{
  "size": "M"
}
```

Comportamento esperado:

- Criar locker com status inicial `free`.
- Retornar o locker criado.

#### `PATCH /lockers/:id`

Atualiza dados de um locker.

Payload sugerido:

```json
{
  "status": "occupied"
}
```

Comportamento esperado:

- Validar se o locker existe.
- Atualizar apenas os campos enviados.
- Retornar o locker atualizado.

### Rentals

#### `POST /rentals`

Cria um novo aluguel.

Payload sugerido:

```json
{
  "locker_id": "locker-001"
}
```

Comportamento esperado:

- Validar se o locker existe.
- Validar se o locker esta livre.
- Gerar codigo unico.
- Criar rental com status `active`.
- Marcar locker como `occupied`.
- Retornar rental criado com o codigo de acesso.

#### `GET /rentals/:id`

Busca um aluguel especifico.

Comportamento esperado:

- Validar se o aluguel existe.
- Retornar dados do aluguel e do locker associado.

### Unlock

#### `POST /unlock`

Valida o codigo de acesso e simula a abertura do locker.

Payload sugerido:

```json
{
  "code": "839204"
}
```

Comportamento esperado:

- Validar se o codigo existe.
- Verificar se o aluguel esta `active`.
- Simular liberacao de acesso.
- Retornar mensagem `Locker aberto`.
- Opcionalmente finalizar o aluguel e liberar o locker.

Resposta sugerida:

```json
{
  "message": "Locker aberto",
  "rental_id": "rental-001",
  "locker_id": "locker-001"
}
```

### Dashboard

#### `GET /dashboard`

Retorna metricas simples para o parceiro.

Metricas sugeridas:

- Total de lockers.
- Lockers livres.
- Lockers ocupados.
- Alugueis ativos.
- Alugueis finalizados.
- Total de alugueis criados.

Exemplo de resposta:

```json
{
  "total_lockers": 10,
  "free_lockers": 6,
  "occupied_lockers": 4,
  "active_rentals": 4,
  "finished_rentals": 12,
  "total_rentals": 16
}
```

## 6. Fluxos Principais

### Fluxo do usuario

1. Usuario acessa `/use`.
2. Sistema lista lockers disponiveis.
3. Usuario escolhe um locker.
4. Usuario clica em `Pagar`.
5. Sistema simula o pagamento.
6. Sistema cria um aluguel.
7. Sistema gera um codigo unico.
8. Sistema marca o locker como ocupado.
9. Usuario visualiza o codigo de acesso.
10. Usuario informa o codigo para abrir o locker.
11. Sistema valida o codigo.
12. Sistema exibe `Locker aberto`.

### Fluxo do parceiro

1. Parceiro acessa `/partner`.
2. Sistema carrega metricas via `GET /dashboard`.
3. Sistema exibe quantidade de lockers livres e ocupados.
4. Sistema exibe alugueis ativos e finalizados.
5. Sistema permite acompanhar o status operacional do MVP.

## 7. Telas

### `/` - Landing Page

Conteudo sugerido:

- Nome da solucao.
- Proposta de valor.
- Chamada para iniciar o fluxo de uso.
- Link para dashboard do parceiro.

### `/use` - Fluxo do Usuario

Componentes sugeridos:

- Lista de lockers livres.
- Filtro ou indicacao por tamanho: `P`, `M`, `G`.
- Botao `Pagar`.
- Area com codigo gerado.
- Campo para inserir codigo de abertura.
- Mensagem de sucesso: `Locker aberto`.
- Mensagem de erro para codigo invalido ou aluguel finalizado.

### `/partner` - Dashboard

Componentes sugeridos:

- Cards de metricas.
- Lista ou tabela de lockers.
- Indicador visual de status: livre ou ocupado.
- Lista simples de alugueis recentes, se houver tempo.

## 8. Logica Principal

### Criacao de aluguel

Regras:

- O locker escolhido deve existir.
- O locker escolhido deve estar com status `free`.
- O codigo gerado deve ser unico entre alugueis ativos.
- Ao criar o aluguel, o locker deve mudar para `occupied`.

Resultado esperado:

- Rental criado com status `active`.
- Locker marcado como `occupied`.
- Codigo retornado para o usuario.

### Abertura do locker

Regras:

- O codigo informado deve existir.
- O aluguel associado deve estar `active`.
- O sistema deve retornar uma confirmacao de abertura.
- A finalizacao do uso pode ser automatica ou acionada como uma etapa separada.

Resultado esperado:

- Mensagem `Locker aberto`.
- Opcionalmente, rental muda para `finished`.
- Opcionalmente, locker volta para `free`.

## 9. Simulacoes

### Pagamento

Implementacao:

- Botao fake `Pagar`.
- Ao clicar, considerar pagamento aprovado.
- Seguir para criacao do aluguel.

### Abertura

Implementacao:

- Enviar codigo para `POST /unlock`.
- Exibir mensagem `Locker aberto` em caso de sucesso.
- Exibir mensagem de erro em caso de codigo invalido.

### QR Code

Implementacao opcional:

- Gerar QR Code com o codigo de acesso.
- O QR pode representar o proprio codigo ou uma URL de abertura.
- Usar biblioteca simples se houver tempo.

## 10. Etapas de Desenvolvimento

### Semana 1 - Setup e estrutura base

Entregas:

- Criar estrutura do projeto.
- Configurar frontend com React + Vite ou Next.js.
- Criar paginas `/`, `/use` e `/partner`.
- Definir estrutura inicial da API.
- Definir modelos `Locker` e `Rental`.
- Criar dados mockados iniciais, se necessario.

Critério de conclusao:

- Aplicacao roda localmente.
- Rotas principais existem.
- Estrutura de dados inicial definida.

### Semana 2 - API basica e fluxo inicial

Entregas:

- Implementar `GET /lockers`.
- Implementar `POST /lockers`.
- Implementar `PATCH /lockers/:id`.
- Implementar `POST /rentals`.
- Listar lockers livres na tela `/use`.
- Permitir escolha de locker.
- Simular pagamento com botao `Pagar`.

Critério de conclusao:

- Usuario consegue escolher um locker livre.
- Sistema consegue criar um aluguel.
- Locker escolhido passa para status `occupied`.

### Semana 3 - Codigo de acesso e abertura

Entregas:

- Implementar geracao de codigo unico.
- Implementar `GET /rentals/:id`.
- Implementar `POST /unlock`.
- Criar tela ou bloco de abertura no fluxo do usuario.
- Validar codigo informado.
- Exibir mensagem `Locker aberto`.
- Tratar erros de codigo invalido.

Critério de conclusao:

- Usuario recebe um codigo unico.
- Usuario consegue abrir locker com codigo valido.
- Codigo invalido nao libera acesso.

### Semana 4 - Dashboard do parceiro

Entregas:

- Implementar `GET /dashboard`.
- Criar cards de metricas em `/partner`.
- Exibir total de lockers, lockers livres e lockers ocupados.
- Exibir alugueis ativos e finalizados.
- Exibir lista simples de lockers com status.

Critério de conclusao:

- Parceiro visualiza o estado atual do sistema.
- Metricas refletem os dados atualizados pelos fluxos de uso.

### Semana 5 - Ajustes finais e apresentacao

Entregas:

- Melhorar UX das telas principais.
- Revisar mensagens de erro e sucesso.
- Ajustar responsividade.
- Adicionar QR Code, se houver tempo.
- Preparar dados de demonstracao.
- Validar fluxo completo ponta a ponta.

Critério de conclusao:

- MVP esta pronto para demonstracao.
- Fluxo completo funciona sem intervencao manual no banco.
- Dashboard atualiza os indicadores esperados.

## 11. Critérios de Sucesso

O MVP sera considerado bem-sucedido se demonstrar:

- Criacao de uso/aluguel.
- Geracao de codigo unico.
- Validacao de acesso.
- Simulacao de abertura do locker.
- Atualizacao de status do locker.
- Visualizacao das metricas no dashboard.
- Separacao clara entre fluxo do usuario e dashboard do parceiro.

## 12. Riscos e Cuidados

### Codigo duplicado

Risco:

- Gerar o mesmo codigo para dois alugueis ativos.

Mitigacao:

- Validar unicidade antes de salvar o aluguel.
- Considerar apenas rentals com status `active` na validacao inicial.

### Estado inconsistente

Risco:

- Rental criado, mas locker nao atualizado.

Mitigacao:

- Centralizar a regra de criacao do aluguel no backend.
- Atualizar rental e locker na mesma operacao logica.

### Demonstracao sem dados

Risco:

- Dashboard vazio ou sem informacao util na apresentacao.

Mitigacao:

- Criar seed de lockers iniciais.
- Preparar alguns alugueis de exemplo, se necessario.

## 13. Roteiro de Demonstracao

1. Acessar `/`.
2. Explicar a proposta de lockers digitais.
3. Acessar `/use`.
4. Escolher um locker livre.
5. Clicar em `Pagar`.
6. Exibir o codigo unico gerado.
7. Informar o codigo para abrir o locker.
8. Exibir mensagem `Locker aberto`.
9. Acessar `/partner`.
10. Mostrar status atualizado dos lockers.
11. Mostrar metricas simples no dashboard.

## 14. Backlog Opcional

Itens que podem ser incluidos apenas se o MVP basico estiver pronto:

- QR Code para codigo de acesso.
- Historico de alugueis no dashboard.
- Filtro por tamanho do locker.
- Botao para finalizar aluguel manualmente.
- Tela de administracao para criar lockers.
- Persistencia em SQLite.
- Deploy simples para demonstracao.
