# Integração do Modelo 3D no Projeto FastLock

Incorporar o visualizador 3D do locker (`3dmodel/model.html`) ao projeto FastLock de forma coerente com o design system existente, melhorar significativamente a aparência do HTML, e traduzir todo o conteúdo para português brasileiro.

---

## Revisão do Usuário

> [!IMPORTANT]
> **Decisão de posicionamento:** O modelo 3D será exibido como uma nova seção na landing page (entre "Benefícios" e "Métricas"), criando um momento de "wow factor" antes do CTA final. Alternativa: substituir o mockup estático do Hero por um iframe do modelo 3D — mais impactante, mas mais pesado no carregamento inicial. Qual prefere?

> [!IMPORTANT]
> **Decisão de carregamento:** O iframe será carregado com `loading="lazy"` para não impactar o tempo de carregamento inicial da página. O modelo 3D só carrega quando a seção entra no viewport. Isso é aceitável?

---

## Perguntas Abertas

> [!WARNING]
> **Rota dedicada ou iframe embutido?** Duas opções:
> - **Opção A (recomendada):** Nova seção na landing page com iframe embutido + link "Ver em tela cheia" que abre `/modelo-3d`
> - **Opção B:** Somente rota dedicada `/modelo-3d` acessível pelo menu
> 
> A Opção A tem maior impacto visual. Confirma?

---

## Mudanças Propostas

### Componente 1 — Melhoria Visual do `model.html`

O arquivo atual usa português de Portugal (PT-PT) e tem um visual funcional mas básico. As melhorias incluem:

#### [MODIFY] [model.html](file:///c:/Users/augus/Desktop/startupone-prototipo/3dmodel/model.html)

**Tradução PT-PT → PT-BR:**
- `lang="pt-PT"` → `lang="pt-BR"`
- "Cacifo" → "Compartimento" / "Locker"
- "rato" → "mouse"
- "Ecrã" → "Tela"
- "A renderizar" → "Carregando"
- "Os seus itens" → "Seus itens"
- "A aguardar leitura" → "Aguardando leitura"
- "Retire ou insira os seus pertences" → "Retire ou insira seus pertences"
- Todos os textos das texturas do canvas (tela do kiosk, scanner, porta)

**Melhorias visuais do HTML/CSS:**

1. **Tipografia premium:** Importar `Inter` e `Plus Jakarta Sans` (mesmas fontes do projeto) via Google Fonts
2. **Painel UI redesenhado:**
   - Glassmorphism consistente com o sistema de design (`.glass` do `style.css`)
   - Bordas arredondadas maiores (`border-radius: 20px`)
   - Gradiente sutil no fundo do painel
   - Animações de entrada suaves (fade-in + slide-up)
3. **Botão estilizado:**
   - Usar paleta brand do Tailwind (`#16a34a` / `#22c55e` para verde, `#0f172a` para escuro)
   - Hover com `box-shadow` e `transform` consistentes com os botões do projeto
   - Transição de cor suave entre estados aberto/fechado
4. **Badge de status:**
   - Animação de pulso sutil no badge quando aberto
   - Ícones animados (rotação suave do cadeado)
5. **Instruções de controle:**
   - Redesenhar com visual de "chip" moderno
   - Animação de fade-in com delay
6. **Loading state:**
   - Spinner animado em vez de texto estático
   - Logo FastLock mini durante carregamento
7. **Ambiente 3D:**
   - Fundo gradiente suave em vez de cor sólida (`#f0f2f5`)
   - Grid sutil no chão para dar profundidade
   - Partículas de luz ambiente (opcional, se performance permitir)

**Melhorias nas texturas Canvas:**

8. **Textura da porta:** Usar cores exatas do brand system (`#16a34a`, `#0f172a`)
9. **Textura da tela do kiosk:** Textos em PT-BR, layout mais refinado
10. **Textura do scanner:** Textos em PT-BR, glow mais suave

---

### Componente 2 — Nova Seção na Landing Page

#### [NEW] [LockerViewerSection.vue](file:///c:/Users/augus/Desktop/startupone-prototipo/frontend/src/components/sections/LockerViewerSection.vue)

Nova seção para a landing page que embute o visualizador 3D:

- **Layout:** Seção full-width com fundo `slate-950` (dark) para contraste dramático
- **Estrutura:**
  - Título: "Veja o Locker de Perto" com subtítulo explicativo
  - Badge: "Experiência Interativa 3D"
  - Iframe embutido (`16:9` no desktop, `4:3` no mobile) com `border-radius: 1.5rem`
  - Borda decorativa com glow verde sutil
  - Botão "Ver em Tela Cheia" abaixo
- **Animações:** ScrollTrigger para entrada progressiva (consistente com outras seções)
- **Responsividade:** Aspect ratio adaptável, padding adequado em mobile
- **Performance:** `loading="lazy"` + `IntersectionObserver` para ativar o iframe somente quando visível

#### [MODIFY] [HomeView.vue](file:///c:/Users/augus/Desktop/startupone-prototipo/frontend/src/views/HomeView.vue)

- Importar e posicionar `LockerViewerSection` entre `BenefitsSection` e `MetricsSection`

---

### Componente 3 — Rota Dedicada (Tela Cheia)

#### [NEW] [ModelViewerView.vue](file:///c:/Users/augus/Desktop/startupone-prototipo/frontend/src/views/ModelViewerView.vue)

Página dedicada `/modelo-3d` para visualização em tela cheia:

- Iframe 100vw × 100vh
- Botão flutuante "Voltar" no canto superior esquerdo (estilo consistente com o projeto)
- Fundo escuro

#### [MODIFY] [router.js](file:///c:/Users/augus/Desktop/startupone-prototipo/frontend/src/router.js)

- Adicionar rota `/modelo-3d` → `ModelViewerView`

#### [MODIFY] [App.vue](file:///c:/Users/augus/Desktop/startupone-prototipo/frontend/src/App.vue)

- Adicionar `/modelo-3d` à lista de rotas sem header/footer (`isHeaderlessRoute` e `isFooterlessRoute`)

---

### Componente 4 — Servir o Arquivo Estático

#### [MODIFY] [vite.config.js](file:///c:/Users/augus/Desktop/startupone-prototipo/frontend/vite.config.js)

- Copiar `3dmodel/model.html` para `frontend/public/3d/model.html` para que seja servido como arquivo estático pelo Vite (arquivos em `public/` são servidos na raiz)

Ou, alternativamente:

#### Arquivo estático copiado

- Copiar `3dmodel/model.html` → `frontend/public/3d/model.html`
- O iframe referencia `/3d/model.html`

---

## Resumo das Mudanças

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `3dmodel/model.html` | MODIFY | Tradução PT-BR, redesign visual completo |
| `frontend/public/3d/model.html` | NEW | Cópia do modelo para servir como estático |
| `LockerViewerSection.vue` | NEW | Seção da landing page com iframe 3D |
| `ModelViewerView.vue` | NEW | Página dedicada tela cheia |
| `HomeView.vue` | MODIFY | Adicionar nova seção |
| `router.js` | MODIFY | Nova rota `/modelo-3d` |
| `App.vue` | MODIFY | Esconder header/footer na rota do modelo |

---

## Plano de Verificação

### Testes Automatizados
- `npm run build` no frontend — build sem erros
- Verificar que `/3d/model.html` é servido corretamente pelo dev server

### Verificação Manual
1. Abrir a landing page e scrollar até a seção do modelo 3D
2. Confirmar que o iframe carrega com lazy loading
3. Interagir com o modelo (rotação, zoom, abrir/fechar)
4. Clicar "Ver em Tela Cheia" e confirmar navegação para `/modelo-3d`
5. Verificar responsividade em mobile (aspect ratio, controles de toque)
6. Confirmar que todos os textos estão em PT-BR
7. Verificar consistência visual (cores, fontes, bordas) com o resto do projeto
