<template>
  <transition name="fade-slide">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-[6px]" @click="close"></div>
      <div class="relative w-[90vw] max-w-lg rounded-4xl border border-white/70 bg-white/90 px-2 py-8 shadow-glow-lg md:w-[600px]">
        <button
          class="absolute top-4 right-4 cursor-pointer text-outline-variant hover:text-primary focus:outline-none"
          @click="close"
          aria-label="Cerrar"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="mt-4 max-h-[80vh] max-w-[90vw] overflow-y-auto p-4">
          <h3 class="mb-2 border-b border-black/10 pb-2 text-2xl font-bold tracking-tight text-on-surface">{{ title }}</h3>
          <p class="whitespace-pre-line text-on-surface-variant">{{ extract }}</p>
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps<{ show: boolean, title: string, extract: string }>()
const emit = defineEmits(['close'])
const close = () => emit('close')

// Bloquear/desbloquear scroll del body al abrir/cerrar modal
const setBodyOverflow = (hidden: boolean) => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = hidden ? 'hidden' : ''
  }
}

watch(() => props.show, (val) => {
  setBodyOverflow(val)
})

onMounted(() => {
  if (props.show) setBodyOverflow(true)
})
onBeforeUnmount(() => {
  setBodyOverflow(false)
})
</script>
