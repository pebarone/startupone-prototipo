# 🚀 Plano de Desenvolvimento — Landing Page SaaS de Produtividade

> **Stack:** Vue 3 (Composition API) · Tailwind CSS · GSAP (micro-animações) · Vite

---

## 1. Visão Geral

| Item              | Detalhe                                                     |
| ----------------- | ----------------------------------------------------------- |
| **Objetivo**      | Converter visitantes em usuários do trial gratuito           |
| **CTA principal** | _"Testar grátis por 14 dias"_                               |
| **Tom de voz**    | Profissional, direto e inspirador                           |
| **Paleta**        | Azul (#1E40AF) · Branco (#FFFFFF) · Verde acento (#10B981)  |
| **Tipografia**    | Inter (headings) · Plus Jakarta Sans (body)                 |

---

## 2. Estrutura de Seções

```
┌─────────────────────────────────────┐
│  Navbar (fixa, glassmorphism)       │
├─────────────────────────────────────┤
│  Hero                               │
│  ├─ Headline + Sub-headline         │
│  ├─ CTA "Testar grátis"            │
│  └─ Mockup animado do produto       │
├─────────────────────────────────────┤
│  Métricas de impacto (contadores)   │
├─────────────────────────────────────┤
│  Features (grid 3 colunas)          │
│  ├─ Ícones animados (GSAP)          │
│  └─ Hover com micro-interação       │
├─────────────────────────────────────┤
│  Integrações (logos carrossel)       │
├─────────────────────────────────────┤
│  Depoimentos (slider)               │
├─────────────────────────────────────┤
│  Preços (3 planos)                  │
├─────────────────────────────────────┤
│  FAQ (accordion)                    │
├─────────────────────────────────────┤
│  CTA final + Newsletter             │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

---

## 3. Stack & Ferramentas

| Categoria         | Tecnologia                        | Justificativa                                      |
| ----------------- | --------------------------------- | -------------------------------------------------- |
| Framework         | **Vue 3** (Composition API + SFC) | Reatividade leve, ecossistema maduro               |
| Build tool        | **Vite**                          | HMR ultra-rápido, tree-shaking                     |
| Estilização       | **Tailwind CSS 3**                | Utility-first, design-system consistente           |
| Micro-animações   | **GSAP 3 + ScrollTrigger**        | Timeline precisa, performance GPU                  |
| Ícones            | **Lucide Icons (vue)**            | Leve, tree-shakeable, visual moderno               |
| Fontes            | **Google Fonts** (Inter, Plus Jakarta Sans) | Boa legibilidade em telas                  |
| Linting           | **ESLint + Prettier**             | Padronização de código                             |
| Deploy            | **Vercel** ou **Netlify**         | CI/CD automático com preview de PR                 |

---

## 4. Micro-animações (GSAP)

| Seção               | Tipo de animação                                         | Trigger            |
| -------------------- | -------------------------------------------------------- | ------------------- |
| Hero                 | Fade-up + scale no mockup                                | On mount            |
| Métricas             | CountUp nos números (0 → valor)                          | ScrollTrigger       |
| Features             | Stagger fade-in dos cards                                | ScrollTrigger       |
| Features hover       | Icon rotate + color shift                                | Mouse enter/leave   |
| Integrações          | Marquee infinito (logos)                                 | Automático          |
| Depoimentos          | Slide horizontal suave                                   | Autoplay + swipe    |
| Preços               | Card "popular" com pulse glow                            | ScrollTrigger       |
| FAQ                  | Accordion height com easing                              | Click               |
| CTA final            | Parallax leve no fundo + botão com ripple                | Scroll + click      |
| Navbar               | Shrink + blur de fundo ao rolar                          | Scroll              |

---

## 5. Componentes Vue

```
src/
├── assets/
│   ├── fonts/
│   └── images/
├── components/
│   ├── layout/
│   │   ├── NavBar.vue
│   │   └── FooterSection.vue
│   ├── sections/
│   │   ├── HeroSection.vue
│   │   ├── MetricsSection.vue
│   │   ├── FeaturesSection.vue
│   │   ├── IntegrationsSection.vue
│   │   ├── TestimonialsSection.vue
│   │   ├── PricingSection.vue
│   │   ├── FaqSection.vue
│   │   └── CtaSection.vue
│   └── ui/
│       ├── BaseButton.vue
│       ├── SectionTitle.vue
│       ├── PricingCard.vue
│       ├── FeatureCard.vue
│       ├── TestimonialCard.vue
│       └── AccordionItem.vue
├── composables/
│   ├── useScrollAnimation.js   # wrapper GSAP + ScrollTrigger
│   └── useCountUp.js           # contadores animados
├── App.vue
├── main.js
└── style.css                   # Tailwind directives + custom
```

---

## 6. Cronograma (estimativa)

| Fase | Tarefa                                            | Duração   |
| ---- | ------------------------------------------------- | --------- |
| 1    | Setup do projeto (Vite + Vue + Tailwind + GSAP)   | 0,5 dia   |
| 2    | Layout base (Navbar, Footer, grid responsivo)      | 1 dia     |
| 3    | HeroSection + micro-animação do mockup             | 1 dia     |
| 4    | MetricsSection com CountUp                         | 0,5 dia   |
| 5    | FeaturesSection + hover animations                 | 1 dia     |
| 6    | IntegrationsSection (marquee)                      | 0,5 dia   |
| 7    | TestimonialsSection (slider)                       | 1 dia     |
| 8    | PricingSection (cards + toggle mensal/anual)       | 1 dia     |
| 9    | FaqSection (accordion GSAP)                        | 0,5 dia   |
| 10   | CtaSection + Newsletter form                       | 0,5 dia   |
| 11   | Responsividade mobile + tablet                     | 1 dia     |
| 12   | Polimento de animações + performance (Lighthouse)  | 1 dia     |
| 13   | Deploy + testes cross-browser                      | 0,5 dia   |
| **Total** |                                               | **~10 dias** |

---

## 7. Checklist de Qualidade

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Responsivo: 320 px → 1920 px
- [ ] Animações respeitam `prefers-reduced-motion`
- [ ] Lazy loading em imagens
- [ ] Fontes com `font-display: swap`
- [ ] Meta tags OG / Twitter Card
- [ ] Favicon + Web Manifest
- [ ] Analytics (GA4 ou Plausible)

---

## 8. Referências de Design

- [Linear.app](https://linear.app) — hero limpo + micro-animações
- [Raycast.com](https://raycast.com) — paleta escura com acentos
- [Notion.so](https://notion.so) — simplicidade + prova social
- [Vercel.com](https://vercel.com) — animações scroll-driven

---

> **Próximo passo:** rodar o setup do projeto e iniciar a fase 1.
