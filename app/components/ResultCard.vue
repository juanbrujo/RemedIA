<template>
  <Motion
    as="a"
    :href="result.link"
    target="_blank"
    rel="noopener"
    :initial="{ opacity: 0, filter: 'blur(12px)', y: 24 }"
    :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
    :transition="{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }"
    :while-tap="{ scale: 0.96, transition: { type: 'spring', stiffness: 500, damping: 25, delay: 0 } }"
    class="group flex cursor-pointer flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-glow backdrop-blur-xl transition-[box-shadow,background-color] hover:shadow-glow-lg active:bg-secondary-container/40 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none md:flex-row md:items-start"
  >
    <div class="relative size-24 shrink-0">
      <img v-if="result.imagen" :src="result.imagen" :alt="result.titulo" class="size-24 rounded-2xl bg-surface-variant object-contain" />
      <div v-else class="flex size-24 items-center justify-center rounded-2xl bg-surface-variant text-xs text-outline">Sin imagen</div>
      <span v-if="result.oferta" class="absolute -top-2 -left-2 rounded-full bg-secondary-container px-2.5 py-0.5 text-[11px] font-bold text-on-secondary-container shadow-sm">{{ result.oferta }}</span>
      <span v-if="isSoldOut" class="absolute -bottom-2 -left-2 rounded-full bg-error-container px-2.5 py-0.5 text-[11px] font-bold text-error shadow-sm">Agotado</span>
    </div>
    <div class="flex w-full min-w-0 flex-1 flex-col gap-1">
      <h4 class="line-clamp-2 text-base leading-tight font-bold text-primary-strong" :title="result.titulo">{{ result.titulo }}</h4>
      <div class="flex items-end justify-between gap-3">
        <p v-if="result.laboratorio" class="min-w-0 truncate text-xs text-on-surface-variant" :title="result.laboratorio">{{ result.laboratorio }}</p>
        <span v-else></span>
        <p class="shrink-0 text-xl leading-none font-extrabold text-on-surface">{{ result.precio }}</p>
      </div>
    </div>
  </Motion>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Motion } from 'motion-v'

const props = withDefaults(defineProps<{
  result: Record<string, any>
  index?: number
}>(), {
  index: 0
})

const isSoldOut = computed(() => !!props.result.status && props.result.status.toLowerCase().includes('agotado'))
</script>
