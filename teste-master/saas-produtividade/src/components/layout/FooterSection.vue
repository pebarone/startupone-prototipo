<script setup>
import { Twitter, Linkedin, Github, Instagram } from 'lucide-vue-next'

const footerLinks = [
  {
    title: 'Produto',
    links: [
      { name: 'Features', href: '#' },
      { name: 'Integrações', href: '#' },
      { name: 'Preços', href: '#' },
      { name: 'Changelog', href: '#' }
    ]
  },
  {
    title: 'Recursos',
    links: [
      { name: 'Blog', href: '#' },
      { name: 'Guias', href: '#' },
      { name: 'Central de Ajuda', href: '#' },
      { name: 'Comunidade', href: '#' }
    ]
  },
  {
    title: 'Empresa',
    links: [
      { name: 'Sobre nós', href: '#' },
      { name: 'Carreiras', href: '#' },
      { name: 'Contato', href: '#' },
      { name: 'Parceiros', href: '#' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Termos de Serviço', href: '#' },
      { name: 'Política de Privacidade', href: '#' },
      { name: 'Cookies', href: '#' },
      { name: 'Segurança', href: '#' }
    ]
  }
]
</script>

<template>
  <footer class="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
    <div class="container mx-auto px-6 md:px-12">
      
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
        
        <!-- Brand -->
        <div class="col-span-2 lg:col-span-1">
          <a href="#" class="flex items-center gap-2 mb-6 group">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              P
            </div>
            <span class="font-heading font-bold text-xl tracking-tight text-dark">ProTask</span>
          </a>
          <p class="text-slate-500 text-sm leading-relaxed mb-6">
            A plataforma definitiva para equipes que querem fazer mais, com menos esforço.
          </p>
          
          <div class="flex items-center gap-4">
            <a href="#" class="text-slate-400 hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter class="w-5 h-5" />
            </a>
            <a href="#" class="text-slate-400 hover:text-primary transition-colors" aria-label="LinkedIn">
              <Linkedin class="w-5 h-5" />
            </a>
            <a href="#" class="text-slate-400 hover:text-primary transition-colors" aria-label="GitHub">
              <Github class="w-5 h-5" />
            </a>
            <a href="#" class="text-slate-400 hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram class="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <!-- Links -->
        <div v-for="(column, index) in footerLinks" :key="index">
          <h4 class="font-bold text-dark mb-6">{{ column.title }}</h4>
          <ul class="space-y-4">
            <li v-for="(link, lIndex) in column.links" :key="lIndex">
              <a :href="link.href" class="text-slate-500 hover:text-primary transition-colors text-sm">
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>
        
      </div>
      
      <!-- Bottom -->
      <div class="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-slate-500 text-sm">
          &copy; {{ new Date().getFullYear() }} ProTask Inc. Todos os direitos reservados.
        </p>
        
        <div class="flex items-center gap-6 text-sm text-slate-500">
          <a href="#" class="hover:text-primary transition-colors">Status</a>
          <a href="#" class="hover:text-primary transition-colors">Privacidade</a>
          <a href="#" class="hover:text-primary transition-colors">Termos</a>
        </div>
      </div>
      
    </div>
  </footer>
</template>
