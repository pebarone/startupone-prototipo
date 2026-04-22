<template>
  <div class="min-h-screen bg-slate-50 pt-24 pb-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Central de Ajuda</h1>
        <p class="mt-4 text-base leading-7 text-slate-600 max-w-2xl mx-auto">
          Encontre respostas rápidas para as dúvidas mais comuns sobre o uso, pagamentos e segurança dos nossos lockers inteligentes.
        </p>
        
        <div class="mt-8 max-w-xl mx-auto relative">
          <label for="help-search" class="sr-only">Buscar na central de ajuda</label>
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            id="help-search"
            name="help_search"
            type="text"
            v-model="searchQuery"
            autocomplete="off"
            enterkeyhint="search"
            class="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 shadow-sm transition-all duration-200" 
            placeholder="Busque por pagamento, biometria ou seguro…" 
          />
        </div>
      </div>

      <!-- FAQ Categories -->
      <div class="space-y-10">
        <section v-for="category in filteredFaqs" :key="category.title">
          <h2 class="text-lg font-bold tracking-tight text-slate-900 mb-4 px-2">{{ category.title }}</h2>
          <div class="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            
            <div 
              v-for="(faq, index) in category.items" 
              :key="index"
              class="group"
            >
              <button 
                type="button" 
                class="w-full flex items-center justify-between px-5 sm:px-6 py-4 min-h-[48px] text-left text-slate-900 font-semibold focus:outline-none focus-visible:bg-slate-50 transition-colors accordion-btn"
                :id="faqButtonId(category.title, index)"
                :aria-expanded="isFaqOpen(category.title, index) ? 'true' : 'false'"
                :aria-controls="faqPanelId(category.title, index)"
                @click="toggleFaq(category.title, index)"
              >
                <span class="pr-6">{{ faq.question }}</span>
                <span class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
                  <svg 
                    class="h-4 w-4 text-slate-500 transition-transform duration-200 ease-out"
                    :class="{ 'rotate-180': isFaqOpen(category.title, index) }" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke-width="2.5" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <div 
                class="accordion-content"
                :id="faqPanelId(category.title, index)"
                role="region"
                :aria-labelledby="faqButtonId(category.title, index)"
                :class="{ 'is-open': isFaqOpen(category.title, index) }"
              >
                <div class="accordion-inner">
                  <div class="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                    <div class="flex-1 mt-2">
                      {{ faq.answer }}
                    </div>
                    <div class="w-20 h-20 sm:w-48 sm:h-auto shrink-0 flex items-center justify-center p-4 sm:p-6 bg-slate-50/50 rounded-2xl border border-slate-100/60 transition-transform duration-500 ease-out hover:scale-105 overflow-hidden">
                      
                      <!-- SVG for open-locker -->
                      <svg v-if="faq.id === 'open-locker'" viewBox="0 0 120 120" class="w-20 h-20 text-brand-600" role="img" aria-label="Usuário escaneando QR code de um locker com o celular">
                        <style>
                          @keyframes scan-beam {
                            0%, 100% { transform: rotate(-10deg); opacity: 0.5; }
                            50% { transform: rotate(10deg); opacity: 1; }
                          }
                          .laser-beam {
                            transform-origin: 57px 53px;
                            animation: scan-beam 2s ease-in-out infinite;
                          }
                        </style>
                        <!-- Locker Cabinet -->
                        <path d="M75 15 h30 a4 4 0 0 1 4 4 v82 a4 4 0 0 1 -4 4 h-30 a4 4 0 0 1 -4 -4 v-82 a4 4 0 0 1 4 -4 z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" class="text-slate-300"/>
                        <!-- Doors -->
                        <rect x="79" y="23" width="22" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-300" />
                        
                        <!-- Active Door with QR Code -->
                        <rect x="79" y="47" width="22" height="26" rx="2" fill="none" stroke="currentColor" stroke-width="3" class="text-brand-500" />
                        <rect x="83" y="54" width="4" height="4" rx="1" fill="currentColor" class="text-brand-600"/>
                        <rect x="93" y="54" width="4" height="4" rx="1" fill="currentColor" class="text-brand-600"/>
                        <rect x="83" y="64" width="4" height="4" rx="1" fill="currentColor" class="text-brand-600"/>
                        <rect x="93" y="64" width="4" height="4" rx="1" fill="currentColor" class="text-brand-600"/>
                        
                        <rect x="79" y="77" width="22" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="3" class="text-slate-300" />

                        <!-- Laser scanning -->
                        <g class="laser-beam">
                          <polygon points="60,53 95,45 95,75" fill="currentColor" class="text-brand-400" opacity="0.15" />
                          <line x1="60" y1="53" x2="95" y2="60" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-brand-400" />
                        </g>

                        <!-- User (Pessoinha) -->
                        <g class="text-slate-700" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                          <!-- Head -->
                          <circle cx="28" cy="38" r="10" fill="currentColor" stroke="none" />
                          <!-- Body -->
                          <line x1="28" y1="48" x2="28" y2="85" stroke-width="8" />
                          <!-- Legs -->
                          <path d="M28 85 L18 115 M28 85 L38 115" stroke-width="8" />
                          <!-- Arm reaching to phone -->
                          <path d="M28 52 L42 62 L52 56" stroke-width="6" />
                        </g>
                        
                        <!-- Phone -->
                        <rect x="52" y="44" width="10" height="18" rx="2" fill="currentColor" stroke="none" class="text-slate-900" transform="rotate(25 57 53)"/>
                      </svg>

                      <!-- SVG for allowed-items -->
                      <svg v-else-if="faq.id === 'allowed-items'" viewBox="0 0 100 100" class="w-20 h-20" role="img" aria-label="Animação de uma mochila indicando itens permitidos">
                        <g class="animate-pop-1 text-slate-700" fill="currentColor">
                          <path d="M40 30 C40 20, 60 20, 60 30 L70 40 L70 80 C70 85, 30 85, 30 80 L30 40 Z" opacity="0.9"/>
                          <rect x="40" y="45" width="20" height="20" rx="4" fill="white" opacity="0.3"/>
                        </g>
                        <circle cx="75" cy="25" r="12" class="fill-brand-100 text-brand-600 animate-pop-2"/>
                        <path d="M75 19 V31 M69 25 H81" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="text-brand-600 animate-pop-2"/>
                      </svg>

                      <!-- SVG for timer-start -->
                      <svg v-else-if="faq.id === 'timer-start'" viewBox="0 0 100 100" class="w-20 h-20 text-brand-600" role="img" aria-label="Animação de um relógio com ponteiros rodando">
                        <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="6"/>
                        <circle cx="50" cy="50" r="30" fill="currentColor" opacity="0.1"/>
                        <path d="M50 25 L50 50 L65 65" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="animate-clock-hand"/>
                        <line x1="50" y1="10" x2="50" y2="5" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
                        <line x1="60" y1="10" x2="65" y2="5" stroke="currentColor" stroke-width="4" stroke-linecap="round" transform="rotate(45 50 50)"/>
                      </svg>

                      <!-- SVG for biometrics -->
                      <svg v-else-if="faq.id === 'biometrics'" viewBox="0 0 100 100" class="w-20 h-20 text-brand-600" role="img" aria-label="Animação de uma impressão digital sendo escaneada">
                        <g fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" class="animate-pulse-slow opacity-80">
                          <path d="M40 75 C30 60, 30 40, 50 30 C70 40, 70 60, 60 75" />
                          <path d="M45 70 C38 55, 40 45, 50 40 C60 45, 62 55, 55 70" />
                          <path d="M50 65 C48 55, 48 50, 50 48" />
                        </g>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="10 10" class="animate-spin-slow opacity-30"/>
                      </svg>

                      <!-- SVG for billing -->
                      <svg v-else-if="faq.id === 'billing'" viewBox="0 0 100 100" class="w-20 h-20 text-brand-600" role="img" aria-label="Animação do símbolo do PIX">
                        <path d="M50 20 L75 50 L50 80 L25 50 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" class="animate-float"/>
                        <path d="M50 35 L62 50 L50 65 L38 50 Z" fill="currentColor" class="animate-float-delayed opacity-80"/>
                        <circle cx="80" cy="30" r="5" fill="currentColor" class="animate-bounce-1 opacity-50"/>
                        <circle cx="20" cy="70" r="4" fill="currentColor" class="animate-bounce-2 opacity-50"/>
                      </svg>

                      <!-- SVG for insurance -->
                      <svg v-else-if="faq.id === 'insurance'" viewBox="0 0 100 100" class="w-20 h-20 text-brand-600" role="img" aria-label="Animação de um escudo de proteção">
                        <path d="M50 15 L80 25 V50 C80 70, 50 85, 50 85 C50 85, 20 70, 20 50 V25 L50 15 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" class="animate-shield"/>
                        <path d="M40 50 L48 58 L65 40" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="animate-draw-check"/>
                      </svg>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- Empty State (Search) -->
        <div v-if="filteredFaqs.length === 0" class="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50">
          <svg class="mx-auto h-10 w-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-sm font-semibold text-slate-900">Nenhum resultado encontrado</h3>
          <p class="mt-1 text-sm text-slate-500">Não encontramos nenhuma dúvida correspondente a "{{ searchQuery }}".</p>
          <button @click="searchQuery = ''" class="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-500">Limpar busca</button>
        </div>
      </div>

      <!-- Support CTA -->
      <div class="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl px-8 py-10 text-center shadow-xl overflow-hidden relative">
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <h2 class="text-2xl font-bold text-white mb-3 relative z-10">Ainda precisa de ajuda?</h2>
        <p class="text-slate-300 text-sm mb-8 max-w-md mx-auto relative z-10">Nossa equipe de suporte está pronta para resolver qualquer problema com sua locação.</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <a href="mailto:ajuda@startupone.com.br" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-slate-900 transition-transform duration-150 hover:scale-[0.98] active:scale-95 shadow-sm">
            <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Enviar e-mail
          </a>
          <button type="button" disabled title="Canal em breve" class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-6 text-sm font-semibold text-white/80 backdrop-blur-sm transition-transform duration-150 disabled:cursor-not-allowed disabled:opacity-80">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.48-1.459-1.653-1.756-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp em breve
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const openFaqs = ref(new Set())

const faqs = [
  {
    title: 'Utilização do Locker',
    items: [
      {
        id: 'open-locker',
        question: 'Como faço para abrir um locker?',
        answer: 'Ao chegar próximo ao locker, acesse o mapa pelo nosso app ou escaneie o QR code colado no armário. Escolha um tamanho, confirme o pagamento inicial (PIX) e cadastre sua biometria (Face ID ou Touch ID). O locker se abrirá automaticamente.'
      },
      {
        id: 'allowed-items',
        question: 'O que posso guardar no locker?',
        answer: 'Você pode guardar mochilas, capacetes, compras, eletrônicos e objetos pessoais em geral. É proibido armazenar armas, explosivos, produtos ilícitos, perecíveis sem embalagem térmica, ou animais vivos.'
      },
      {
        id: 'timer-start',
        question: 'A partir de quando o tempo começa a contar?',
        answer: 'A cobrança por hora só começa a ser contada após você colocar seus itens e fechar a porta fisicamente através do nosso aplicativo. O tempo que a porta fica aberta organizando os itens não é cobrado na tarifa por hora, apenas a taxa de ativação inicial.'
      }
    ]
  },
  {
    title: 'Biometria e Segurança',
    items: [
      {
        id: 'biometrics',
        question: 'Como funciona a chave biométrica?',
        answer: 'Nós usamos a tecnologia WebAuthn (Passkeys), que vincula o acesso do locker ao seu celular usando o seu leitor de digital ou reconhecimento facial. Suas características biométricas nunca saem do seu aparelho, garantindo 100% de privacidade.'
      }
    ]
  },
  {
    title: 'Preços e Pagamentos',
    items: [
      {
        id: 'billing',
        question: 'Como funciona a cobrança?',
        answer: 'Há uma Taxa de Ativação inicial (paga via PIX para abrir a porta) e uma Taxa por Hora (cobrada proporcionalmente no final do uso). Ao retirar os itens, você passa novamente pela biometria, o sistema calcula o tempo extra e solicita o pagamento final (se houver).'
      },
      {
        id: 'insurance',
        question: 'Existe seguro para os meus itens?',
        answer: 'Sim! Todos os lockers da FastLock possuem Tech Insurance. Seus pertences estão segurados contra furtos e danos estruturais no equipamento. A apólice já está embutida na taxa de ativação.'
      }
    ]
  }
]

const filteredFaqs = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return faqs

  return faqs.map(category => {
    const filteredItems = category.items.filter(item => 
      item.question.toLowerCase().includes(query) || 
      item.answer.toLowerCase().includes(query)
    )
    return {
      ...category,
      items: filteredItems
    }
  }).filter(category => category.items.length > 0)
})

function toggleFaq(categoryTitle, index) {
  const id = faqKey(categoryTitle, index)
  if (openFaqs.value.has(id)) {
    openFaqs.value.delete(id)
  } else {
    openFaqs.value.add(id)
  }
}

function isFaqOpen(categoryTitle, index) {
  return openFaqs.value.has(faqKey(categoryTitle, index))
}

function faqKey(categoryTitle, index) {
  return `${categoryTitle}-${index}`
}

function faqButtonId(categoryTitle, index) {
  return `faq-button-${slugifyFaqId(categoryTitle)}-${index}`
}

function faqPanelId(categoryTitle, index) {
  return `faq-panel-${slugifyFaqId(categoryTitle)}-${index}`
}

function slugifyFaqId(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
</script>

<style scoped>
.accordion-btn {
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms;
}

.accordion-btn:active {
  transform: scale(0.99);
}

.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 250ms cubic-bezier(0.23, 1, 0.32, 1);
}

.accordion-content.is-open {
  grid-template-rows: 1fr;
}

.accordion-inner {
  overflow: hidden;
}

/* SVG Animations */

@keyframes scan-beam {
  0%, 100% { transform: rotate(-10deg); opacity: 0.5; }
  50% { transform: rotate(10deg); opacity: 1; }
}
.animate-laser-beam { 
  transform-origin: 57px 53px;
  animation: scan-beam 2s ease-in-out infinite; 
}

@keyframes pop {
  0%, 100% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}
.animate-pop-1 { 
  animation: pop 3s ease-in-out infinite; 
  transform-origin: center; 
}
.animate-pop-2 { 
  animation: pop 3s ease-in-out infinite 0.5s; 
  transform-origin: center; 
}

@keyframes tick {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-clock-hand {
  transform-origin: 50px 50px;
  animation: tick 4s linear infinite;
}

.animate-spin-slow { 
  animation: tick 12s linear infinite; 
  transform-origin: 50px 50px; 
}
.animate-pulse-slow { 
  animation: pop 3s ease-in-out infinite; 
  transform-origin: 50px 50px; 
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.animate-float { 
  animation: float 3s ease-in-out infinite; 
}
.animate-float-delayed { 
  animation: float 3s ease-in-out infinite 0.2s; 
}

@keyframes bounce-sm {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.animate-bounce-1 { 
  animation: bounce-sm 2s ease-in-out infinite 0.5s; 
}
.animate-bounce-2 { 
  animation: bounce-sm 2.5s ease-in-out infinite 1s; 
}

@keyframes shield-pulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3)); }
}
.animate-shield { 
  transform-origin: 50px 50px; 
  animation: shield-pulse 3s ease-in-out infinite; 
}

@keyframes draw {
  0%, 20% { stroke-dasharray: 0 100; opacity: 0; }
  50%, 100% { stroke-dasharray: 100 100; opacity: 1; }
}
.animate-draw-check { 
  stroke-dasharray: 100; 
  animation: draw 3s ease-in-out infinite; 
}

@media (prefers-reduced-motion: reduce) {
  .animate-laser-beam,
  .animate-pop-1,
  .animate-pop-2,
  .animate-clock-hand,
  .animate-spin-slow,
  .animate-pulse-slow,
  .animate-float,
  .animate-float-delayed,
  .animate-bounce-1,
  .animate-bounce-2,
  .animate-shield,
  .animate-draw-check {
    animation: none;
  }
}
</style>
