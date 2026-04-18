<template>
  <footer class="py-12 bg-slate-50 border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 text-slate-500 text-sm">
      <div class="md:col-span-2">
        <RouterLink to="/" class="flex items-center gap-2 mb-4 group inline-flex">
          <div class="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <span class="font-heading font-black text-lg tracking-tight text-slate-900 group-hover:text-brand-900 transition-colors">
            Fast<span class="text-brand-600">Lock</span>
          </span>
        </RouterLink>
        <p class="max-w-xs text-slate-500 mb-6">
          A plataforma SaaS de Tech Insurance que transforma qualquer estabelecimento comercial em um hub seguro e inteligente para armazenamento local.
        </p>
        <p>© 2026 FastLock by StartupOne. Todos os direitos reservados.</p>
      </div>

      <div>
        <h6 class="font-bold text-slate-900 mb-4">Plataforma</h6>
        <ul class="space-y-3">
          <li><RouterLink to="/#como-funciona" class="block py-1.5 hover:text-brand-600 transition-colors">Como funciona</RouterLink></li>
          <li><RouterLink to="/#solucao" class="block py-1.5 hover:text-brand-600 transition-colors">Seguros (Tech Insurance)</RouterLink></li>
          <li><RouterLink to="/#solucao" class="block py-1.5 hover:text-brand-600 transition-colors">Cobrança por Hora</RouterLink></li>
          <li><RouterLink to="/use" class="block py-1.5 hover:text-brand-600 transition-colors">Encontrar Lockers</RouterLink></li>
        </ul>
      </div>

      <div>
        <h6 class="font-bold text-slate-900 mb-4">Parceiros</h6>
        <ul class="space-y-3">
          <li><RouterLink to="/#parceiros" class="hover:text-brand-600 transition-colors">Seja um Parceiro</RouterLink></li>
          <li><RouterLink to="/#parceiros" class="hover:text-brand-600 transition-colors">Hardware Lockers</RouterLink></li>
          <li><RouterLink to="/login" class="hover:text-brand-600 transition-colors">Dashboard Login</RouterLink></li>
          <li><RouterLink to="/ajuda" class="hover:text-brand-600 transition-colors">Central de Ajuda</RouterLink></li>
        </ul>
      </div>
    </div>
  </footer>
</template>