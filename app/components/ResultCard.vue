<template>
  <div class="bg-white/90 rounded-[10px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 flex flex-col md:flex-row gap-4 items-center md:items-center">
    <div class="w-full md:w-24 flex-shrink-0 flex justify-center md:block mb-3 md:mb-0">
      <a v-if="result.imagen" :href="result.link" target="_blank" rel="noopener">
        <img :src="result.imagen" :alt="result.titulo" class="rounded-md object-contain w-24 h-24 bg-surface-variant" />
      </a>
      <div v-else class="w-24 h-24 flex items-center justify-center bg-surface-variant text-outline-variant rounded-md text-xs">Sin imagen</div>
    </div>
    <div class="flex-1 min-w-0 w-full">
      <a :href="result.link" target="_blank" rel="noopener" class="block font-bold text-lg text-primary hover:underline mb-1 md:truncate leading-tight">{{ result.titulo }}</a>
      <p v-if="result.laboratorio" class="text-xs text-on-surface-variant mb-1">{{ result.laboratorio }}</p>
      <p class="text-on-surface font-bold mb-1">{{ result.precio }}</p>
      <span v-if="result.oferta" class="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mr-2">{{ result.oferta }}</span>
      <span v-if="result.status && result.status.toLowerCase().includes('agotado')" class="inline-block bg-red-100 text-error text-xs px-2 py-0.5 rounded">Agotado</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})
</script>
