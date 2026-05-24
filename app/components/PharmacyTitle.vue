<template>
  <h3 class="font-headline-md text-[22px] text-primary mb-6 text-center font-bold">
    {{ name }}
  </h3>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
