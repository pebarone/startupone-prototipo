<template>
  <section class="relative overflow-hidden border-t border-slate-800 bg-slate-950 py-24 sm:py-28">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_28%)]" />
    <div class="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(148,163,184,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />

    <div class="relative z-10 mx-auto max-w-4xl px-6 lg:px-8">
      <div class="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-10 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:px-10 sm:py-14">
        <div class="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/12 px-4 py-2 text-sm font-semibold text-brand-100">
          <span class="h-2 w-2 rounded-full bg-brand-400" />
          Pronto para usar ou ativar no seu ponto
        </div>

        <h2 class="mx-auto mt-6 max-w-[12ch] text-4xl font-heading font-black leading-[0.96] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Use a FastLock do seu jeito.
        </h2>

        <p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Guarde itens por algumas horas ou leve a operacao para o seu estabelecimento com a mesma infraestrutura.
        </p>

        <div class="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <RouterLink
            to="/use"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-semibold text-white shadow-sm shadow-brand-500/20 transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-md"
          >
            Comecar a guardar
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </RouterLink>

          <RouterLink
            :to="partnerCtaHref"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-6 text-sm font-semibold text-white transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand-400/35 hover:bg-white/[0.08]"
          >
            <svg class="h-4 w-4 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Cadastrar estabelecimento
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
const partnerCtaHref = computed(() => (isAuthenticated.value ? '/account' : '/login'))
</script>
