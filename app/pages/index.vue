<template>
  <div class="relative min-h-screen bg-background font-body-md antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container py-section-gap px-4 md:px-0">
    <main class="max-w-4xl mx-auto w-full pt-14 md:pt-24">
      <!-- Vibrant moving gradient background -->
      <div class="absolute inset-0 bg-surface -z-10"></div>
      <!-- Sophisticated deep gradient base -->
      <div class="absolute inset-0 opacity-20 -z-10"
        style="background: radial-gradient(circle at 10% 20%, #312e81 0%, transparent 50%), radial-gradient(circle at 90% 80%, #581c87 0%, transparent 50%), radial-gradient(circle at 50% 50%, #134e4a 0%, transparent 70%);">
      </div>
      <h1 class="font-display-xl text-[40px] md:text-[64px] leading-[1.1] tracking-tighter text-on-surface text-center mb-2 drop-shadow-sm">
        RemedIA <span aria-label="píldora" title="RemedIA">💊</span>
      </h1>
      <p class="font-body-lg text-body-lg text-on-surface-variant text-center mb-8">
        Busca y compara remedios en las 2 RemedIAs más baratas
      </p>

      <div class="bg-white/40 rounded-[10px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-xl p-8 mb-10">
        <form @submit.prevent="searchRemedies" class="space-y-4">
          <div>
            <label for="query" class="block text-label-caps font-label-caps text-on-surface-variant mb-2 uppercase tracking-widest">
              Buscar remedios
            </label>
            <div class="relative">
              <input 
                type="text" 
                id="query" 
                v-model="searchQuery"
                maxlength="32"
                class="w-full px-5 py-3 border border-outline-variant rounded-full bg-white/60 font-display-xl text-[18px] text-on-surface leading-2 tracking-wider placeholder:text-outline focus:ring-2 focus:ring-primary/30 pr-12 transition-all"
                placeholder="Nombre del remedio o principio activo..."
              >
              <button
                v-if="searchQuery"
                type="button"
                @click="clearSearch"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary focus:outline-none"
                aria-label="Limpiar búsqueda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button 
              type="submit" 
              :disabled="isLoading || !searchQuery.trim() || searchQuery.trim().toLowerCase() === lastSearchedQuery.toLowerCase()"
              class="px-8 py-3 bg-gradient-to-b from-[#38BDF8]/10 to-transparent text-on-primary rounded-full font-bold shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 disabled:opacity-50 transition-all text-body-md cursor-pointer border-1 border-white"
            >
              {{ isLoading ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>
        </form>
      </div>

      <Transition name="fade-slide" mode="out-in">
        <div v-if="resultsByPharmacy.Farmex.length > 0 || resultsByPharmacy.Curie.length > 0">
          
          <h2 class="font-headline-lg leading-tight text-[24px] md:text-[32px] text-on-surface mb-8 text-center">
            Resultados de búsqueda para
            <a
              v-if="wikiExtract"
              href="#"
              @click.prevent="showWikiModal = true"
              class="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps px-4 py-1 rounded-full uppercase italic border-b-2 border-green-500 decoration-dotted hover:decoration-solid"
            >
              {{ searchQuery.trim() }}
            </a>
            <span v-else class="bg-secondary-container text-on-secondary-container font-label-caps text-label-caps rounded-full uppercase italic">{{ searchQuery.trim() }}</span>
          </h2>
          <WikiModal
            v-if="wikiExtract"
            :show="showWikiModal"
            :title="wikiTitle"
            :extract="wikiExtract"
            @close="showWikiModal = false"
          >
            <template #footer>
              <a :href="wikiLink" target="_blank" rel="noopener" class="text-primary underline mt-4 inline-block">Ver en Wikipedia</a>
            </template>
          </WikiModal>
          <div class="grid grid-cols-2 gap-4 md:gap-8">
            <!-- Farmex Column -->
            <div>
              <PharmacyTitle name="Farmex" />
              <div v-if="resultsByPharmacy.Farmex.length > 0" class="space-y-6" key="farmex-results">
                <ResultCard v-for="(item, idx) in resultsByPharmacy.Farmex" :key="'farmex-' + idx" :result="item" />
              </div>
              <div v-else class="text-center text-outline-variant" key="farmex-empty">Sin resultados</div>
            </div>
            <!-- Curie Column -->
            <div>
              <PharmacyTitle name="Curie" />
              <Transition name="fade-slide" mode="out-in">
                <div v-if="resultsByPharmacy.Curie.length > 0" class="space-y-6" key="curie-results">
                  <ResultCard v-for="(item, idx) in resultsByPharmacy.Curie" :key="'curie-' + idx" :result="item" />
                </div>
                <div v-else class="text-center text-outline-variant" key="curie-empty">Sin resultados</div>
              </Transition>
            </div>  
          </div>
        </div>

        <div v-else-if="!isLoading && searched && resultsByPharmacy.Farmex.length === 0 && resultsByPharmacy.Curie.length === 0">
          <p class="text-center text-headline-md text-on-surface group-hover:text-primary transition-colors text-xl font-light">
            No se encontraron resultados. 💥 Intente con otro término.
          </p>
        </div>
      </Transition>
      <AppFooter v-if="resultsByPharmacy.Farmex.length > 0 || resultsByPharmacy.Curie.length > 0" />
    </main>
  </div>
</template>



<script setup lang="ts">

import { ref, Transition } from 'vue'
import { useFetch } from '#app'
import ResultCard from '~/components/ResultCard.vue'
import AppFooter from '~/components/AppFooter.vue'
import PharmacyTitle from '~/components/PharmacyTitle.vue'
import WikiModal from '~/components/WikiModal.vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'RemedIA | Busca y compara remedios',
  meta: [
    { name: 'description', content: 'RemedIA 💊: Busca y compara precios de remedios en Farmex y Curie. Encuentra el mejor precio y disponibilidad en tus RemedIAs favoritas.' },
    { name: 'keywords', content: 'RemedIA, remedios, precios, comparar, medicamentos, farmex, curie, trazodona, trittico, chile' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { property: 'og:title', content: 'RemedIA 💊 | Busca y compara remedios' },
    { property: 'og:description', content: 'Busca y compara precios de remedios en Farmex y Curie.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'RemedIA 💊' }
  ],
  link: [
    { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💊</text></svg>' }
  ]
})


const searchQuery = ref('')
const lastSearchedQuery = ref('')
const resultsByPharmacy = ref({ Farmex: [], Curie: [] })
const isLoading = ref(false)
const searched = ref(false)

// Wikipedia modal state
const showWikiModal = ref(false)
const wikiExtract = ref('')
const wikiTitle = ref('')
const wikiLink = ref('')

const fetchWikipedia = async (query: string) => {
  const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(query)}&format=json&origin=*`
  try {
    const res = await fetch(url)
    const json = await res.json()
    const pages = json.query?.pages || {}
    const page = Object.values(pages)[0]
    if (page && page.extract) {
      wikiExtract.value = page.extract
      wikiTitle.value = page.title
      wikiLink.value = `https://es.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
      return true
    }
  } catch (e) {
    // ignore
  }
  wikiExtract.value = ''
  wikiTitle.value = ''
  wikiLink.value = ''
  return false
}

const searchRemedies = async () => {
  if (!searchQuery.value.trim()) return

  // Clear previous results before searching
  resultsByPharmacy.value = { Farmex: [], Curie: [] }

  isLoading.value = true
  searched.value = true

  // Fetch Wikipedia info in parallel
  await fetchWikipedia(searchQuery.value.trim())

  try {
    // Call our scraping API endpoint
    const { data, error } = await useFetch(`/api/search?q=${encodeURIComponent(searchQuery.value)}`)

    if (error.value) {
      throw error.value
    }

    // Organize results by pharmacy (Farmex, RemedIAs Curie)
    const pharmacyResults = data.value?.results || []
    const byPharmacy = { Farmex: [], Curie: [] }

    pharmacyResults.forEach(pharmacy => {
      if (pharmacy.results && Array.isArray(pharmacy.results)) {
        if (pharmacy.pharmacy === 'Farmex') {
          byPharmacy.Farmex.push(...pharmacy.results)
        } else if (pharmacy.pharmacy.toLowerCase().includes('curie')) {
          byPharmacy.Curie.push(...pharmacy.results)
        }
      }
    })

    resultsByPharmacy.value = byPharmacy
    lastSearchedQuery.value = searchQuery.value.trim()
  } catch (error) {
    console.error('Error searching:', error)
    resultsByPharmacy.value = { Farmex: [], Curie: [] }
  } finally {
    isLoading.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  resultsByPharmacy.value = { Farmex: [], Curie: [] }
  wikiExtract.value = ''
  wikiTitle.value = ''
  wikiLink.value = ''
}
</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
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
