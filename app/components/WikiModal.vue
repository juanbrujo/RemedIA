<template>
  <transition name="fade-slide">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-[6px]" @click="close"></div>
      <div
        class="relative bg-white/90 rounded-[32px] shadow-xl max-w-lg w-[90vw] md:w-[600px] px-2 py-8"
      >
        <button
          class="absolute top-4 right-4 text-2xl cursor-pointer text-outline-variant hover:text-primary focus:outline-none"
          @click="close"
          aria-label="Cerrar"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="p-4 mt-4 overflow-y-auto" :style="{ maxWidth: '90vw', maxHeight: '80vh' }">
          <h3 class="font-headline-md text-on-surface font-bold border-b border-black/10 pb-2 mb-2">{{ title }}</h3>
          <p class="font-body-md text-on-surface-variant whitespace-pre-line">{{ extract }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, onMounted, onBeforeUnmount } from 'vue'
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

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
