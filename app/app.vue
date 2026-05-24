

<template>
  <div>
    <Index />
  </div>
</template>

<script setup>
import Index from './pages/index.vue'
import './tailwind.css'
import { useHead } from '@unhead/vue'
useHead({
  link: [
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' }
  ]
})
</script>
