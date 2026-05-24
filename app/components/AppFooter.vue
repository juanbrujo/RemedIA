<template>
  <footer class="bg-transparent w-full py-8 text-primary font-body-md text-body-md mt-6">
    <div class="max-w-[1515px] mx-auto px-container-padding flex flex-col md:flex-row justify-between items-center sm:gap-8">
      <div class="font-display-xl text-headline-lg hover:opacity-100 transition-opacity flex items-center gap-2 text-on-surface">
        💊
      </div>
      <div class="text-sm text-on-surface opacity-40">
        © {{ currentYear }} Jorginho Luis. Hecho solo para facilitarme la vida.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
