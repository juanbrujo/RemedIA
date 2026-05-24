<template>
  <footer class="bg-transparent w-full py-8 text-primary font-body-md text-body-md mt-8 border-t-2">
    <div class="max-w-[1515px] mx-auto px-container-padding flex flex-col md:flex-row justify-between items-center sm:gap-8">
      <div class="font-display-xl text-headline-lg hover:opacity-100 transition-opacity flex items-center gap-2 text-on-surface">
        💊 <span v-if="version" class="text-sm text-on-surface opacity-40">v{{ version }}</span>
      </div>
      <div class="flex gap-1 text-sm text-on-surface opacity-40">
        © {{ currentYear }} Remed<i class="-ml-1">IA</i> · <a href="https://github.com/juanbrujo" class="cursor-pointer underline inline-flex items-center gap-1" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="inline align-middle opacity-60"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.479C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
        </a> · Hecho solo para facilitarme la vida.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#app'
const currentYear = new Date().getFullYear()
const version = useRuntimeConfig().public.version || ''
</script>
