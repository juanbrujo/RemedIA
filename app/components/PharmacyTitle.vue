<template>
  <h3 class="mb-6 flex justify-center">
    <SparklesText
      :text="name"
      class="text-2xl font-extrabold tracking-tight text-primary-strong md:text-4xl"
      :colors="{ first: '#ff5e3a', second: '#80b1c7' }"
      :sparkles-count="6"
    />
  </h3>
</template>

<script setup lang="ts">
import SparklesText from '~/components/inspira/ui/SparklesText.vue'

defineProps<{ name: string }>()
</script>
