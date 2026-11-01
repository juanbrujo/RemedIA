<template>
  <div class="relative min-h-screen overflow-x-clip bg-background px-4 py-10 antialiased selection:bg-primary-container selection:text-on-surface md:py-16">
    <!-- Atmospheric gradient background -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 opacity-60"
      style="background: radial-gradient(circle at 10% 10%, #ffdbd0 0%, transparent 45%), radial-gradient(circle at 90% 30%, #bbe9ff 0%, transparent 45%), radial-gradient(circle at 50% 90%, #d6ed7a 0%, transparent 50%);"
    ></div>

    <main class="mx-auto w-full max-w-4xl pt-6 md:pt-12">
      <h1 class="mb-4 flex items-center justify-center gap-3">
        <SparklesText
          text="RemedIA"
          class="text-5xl leading-tight font-extrabold tracking-tighter text-on-surface md:text-7xl"
          :colors="{ first: '#ff5e3a', second: '#80b1c7' }"
          :sparkles-count="12"
        />
        <span class="text-4xl md:text-6xl" aria-label="píldora" title="RemedIA">💊</span>
      </h1>
      <p class="mb-10 text-center text-lg text-on-surface-variant">
        Busca y compara remedios en las farmacias más cercanas que tenemos
      </p>

      <div class="sticky top-3 z-40 mb-3 rounded-full border border-white/70 bg-white/70 p-2 shadow-glow backdrop-blur-xl">
        <form @submit.prevent="searchRemedies" class="flex flex-nowrap items-stretch gap-2">
          <label for="query" class="sr-only">Buscar remedios</label>
          <div class="relative min-w-0 flex-1">
            <input
              type="text"
              id="query"
              v-model="searchQuery"
              maxlength="32"
              class="w-full rounded-full border border-outline-variant bg-white/80 py-2.5 pr-10 pl-5 text-base tracking-wide text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30 md:text-lg"
              placeholder="Remedio o principio activo..."
            >
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-outline hover:text-primary focus:outline-none"
              aria-label="Limpiar búsqueda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <button
            type="submit"
            :disabled="isLoading || !searchQuery.trim() || searchQuery.trim().toLowerCase() === lastSearchedQuery.toLowerCase()"
            class="shrink-0 cursor-pointer rounded-full whitespace-nowrap bg-linear-to-r from-primary to-primary-container px-5 py-2.5 font-bold text-on-primary shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:outline-none disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 md:px-8"
          >
            {{ isLoading ? 'Buscando...' : 'Buscar' }}
          </button>
        </form>
      </div>

      <!-- Farmacias a mostrar -->
      <div class="mb-10 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Farmacias">
        <label v-for="name in pharmacies" :key="name">
          <input
            type="checkbox"
            class="peer sr-only"
            :value="name"
            v-model="selectedPharmacies"
            :disabled="selectedPharmacies.length === 1 && selectedPharmacies.includes(name)"
          >
          <span class="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-sm font-bold text-on-surface-variant shadow-sm backdrop-blur-xl transition-all select-none hover:-translate-y-0.5 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-disabled:cursor-not-allowed">
            <svg v-if="selectedPharmacies.includes(name)" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>
            {{ name }}
          </span>
        </label>
      </div>

      <!-- Ancla del scroll: scroll-mt deja espacio para el buscador sticky -->
      <div ref="resultsEl" class="scroll-mt-24">
      <Transition name="fade-slide" mode="out-in">
        <div v-if="hasResults" :key="lastSearchedQuery">
          <h2 class="mb-8 text-center text-2xl leading-tight font-bold tracking-tight text-on-surface md:text-3xl">
            Resultados de búsqueda para
            <a
              v-if="wikiExtract"
              href="#"
              @click.prevent="showWikiModal = true"
              class="rounded-full border-b-2 border-primary bg-secondary-container px-4 py-1 text-sm font-bold tracking-widest text-on-secondary-container uppercase italic decoration-dotted hover:decoration-solid"
            >
              {{ lastSearchedQuery }}
            </a>
            <span v-else class="rounded-full bg-secondary-container px-4 py-1 text-sm font-bold tracking-widest text-on-secondary-container uppercase italic">{{ lastSearchedQuery }}</span>
          </h2>
          <a
            :href="salcobrandUrl"
            target="_blank"
            rel="noopener"
            class="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-2 text-sm font-bold text-primary-strong shadow-glow backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-glow-lg active:scale-95"
          >
            También buscar en Salcobrand <span aria-hidden="true">↗</span>
          </a>
          <WikiModal
            v-if="wikiExtract"
            :show="showWikiModal"
            :title="wikiTitle"
            :extract="wikiExtract"
            @close="showWikiModal = false"
          >
            <template #footer>
              <a :href="wikiLink" target="_blank" rel="noopener" class="mt-4 inline-block text-primary-strong underline">Ver en Wikipedia</a>
            </template>
          </WikiModal>
          <div class="grid items-start gap-4 md:gap-8" :class="visibleColumns.length > 1 ? 'grid-cols-2' : 'mx-auto max-w-md grid-cols-1'">
            <div v-for="(column, colIdx) in visibleColumns" :key="colIdx" class="space-y-10">
              <div v-for="pharmacy in column" :key="pharmacy">
                <PharmacyTitle :name="pharmacy" />
                <div v-if="resultsByPharmacy[pharmacy].length > 0" class="space-y-6">
                  <ResultCard
                    v-for="(item, idx) in resultsByPharmacy[pharmacy]"
                    :key="pharmacy + '-' + idx"
                    :result="item"
                    :index="idx"
                  />
                </div>
                <div v-else class="text-center text-outline">Sin resultados</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!isLoading && searched">
          <p class="text-center text-xl font-light text-on-surface">
            No se encontraron resultados. 💥 Intente con otro término.
          </p>
          <div class="mt-6">
            <a
              :href="salcobrandUrl"
              target="_blank"
              rel="noopener"
              class="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-2 text-sm font-bold text-primary-strong shadow-glow backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-glow-lg active:scale-95"
            >
              También buscar en Salcobrand <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </Transition>
      </div>
      <AppFooter v-if="hasResults" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import ResultCard from '~/components/ResultCard.vue'
import AppFooter from '~/components/AppFooter.vue'
import PharmacyTitle from '~/components/PharmacyTitle.vue'
import WikiModal from '~/components/WikiModal.vue'
import SparklesText from '~/components/inspira/ui/SparklesText.vue'
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
    { property: 'og:site_name', content: 'RemedIA 💊' },
    // PWA manifest
    { name: 'theme-color', content: '#fff9ee' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'RemedIA' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
    { rel: 'apple-touch-icon', href: '/favicon.png' }
  ]
})

// `match` se compara contra el nombre que devuelve cada scraper (en minúsculas)
const pharmacyDefs = [
  { name: 'Farmex', match: 'farmex' },
  { name: 'Curie', match: 'curie' },
  { name: 'Ahumada', match: 'ahumada' },
  { name: 'Dr. Simi', match: 'simi' }
] as const
type Pharmacy = typeof pharmacyDefs[number]['name']
type PharmacyResults = Record<Pharmacy, Record<string, any>[]>

const pharmacies = pharmacyDefs.map(p => p.name)
// Dos columnas apiladas: evita huecos si una farmacia tiene más resultados que otra
const pharmacyColumns: Pharmacy[][] = [['Farmex', 'Ahumada'], ['Curie', 'Dr. Simi']]

// Farmacias marcadas en los chips. Solo filtra lo que se muestra; la búsqueda consulta todas.
const selectedPharmacies = ref<Pharmacy[]>([...pharmacies])
const visibleColumns = computed(() =>
  pharmacyColumns
    .map(column => column.filter(name => selectedPharmacies.value.includes(name)))
    .filter(column => column.length > 0)
)

const emptyResults = (): PharmacyResults =>
  Object.fromEntries(pharmacies.map(name => [name, []])) as unknown as PharmacyResults

const searchQuery = ref('')
const lastSearchedQuery = ref('')
const resultsByPharmacy = ref<PharmacyResults>(emptyResults())
const isLoading = ref(false)
const searched = ref(false)
const resultsEl = ref<HTMLElement | null>(null)

const salcobrandUrl = computed(() => `https://salcobrand.cl/search_result?query=${encodeURIComponent(lastSearchedQuery.value || searchQuery.value.trim())}`)

const hasResults = computed(() => selectedPharmacies.value.some(p => resultsByPharmacy.value[p].length > 0))

// Wikipedia modal state
const showWikiModal = ref(false)
const wikiExtract = ref('')
const wikiTitle = ref('')
const wikiLink = ref('')

const resetWiki = () => {
  wikiExtract.value = ''
  wikiTitle.value = ''
  wikiLink.value = ''
}

const fetchWikipedia = async (query: string) => {
  const url = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(query)}&format=json&origin=*`
  try {
    const res = await fetch(url)
    const json = await res.json()
    const pages = json.query?.pages || {}
    const page: any = Object.values(pages)[0]
    if (page && page.extract) {
      wikiExtract.value = page.extract
      wikiTitle.value = page.title
      wikiLink.value = `https://es.wikipedia.org/wiki/${encodeURIComponent(page.title)}`
      return
    }
  } catch (e) {
    // ignore
  }
  resetWiki()
}

// "$25.790" (Farmex) o "$15,500" (Curie) -> 25790. Sin precio válido va al final.
const priceValue = (precio: unknown) => {
  const n = parseInt(String(precio ?? '').replace(/\D/g, ''), 10)
  return Number.isNaN(n) ? Infinity : n
}

const fetchPrices = async (query: string) => {
  const data: any = await $fetch('/api/search', { query: { q: query } })
  const byPharmacy = emptyResults()
  for (const pharmacy of data?.results || []) {
    if (!Array.isArray(pharmacy.results)) continue
    const def = pharmacyDefs.find(d => String(pharmacy.pharmacy).toLowerCase().includes(d.match))
    if (def) byPharmacy[def.name].push(...pharmacy.results)
  }
  for (const p of pharmacies) byPharmacy[p].sort((a, b) => priceValue(a.precio) - priceValue(b.precio))
  return byPharmacy
}

const scrollToResults = async () => {
  await nextTick()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resultsEl.value?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
}

const searchRemedies = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  // Clear previous results before searching
  resultsByPharmacy.value = emptyResults()
  showWikiModal.value = false

  isLoading.value = true
  searched.value = true
  // Cierra el teclado en móvil para ver los resultados
  ;(document.activeElement as HTMLElement | null)?.blur()

  try {
    // Wikipedia y precios en paralelo
    const [, byPharmacy] = await Promise.all([fetchWikipedia(query), fetchPrices(query)])
    resultsByPharmacy.value = byPharmacy
    lastSearchedQuery.value = query
  } catch (error) {
    console.error('Error searching:', error)
    resultsByPharmacy.value = emptyResults()
  } finally {
    isLoading.value = false
  }
  scrollToResults()
}

const clearSearch = () => {
  searchQuery.value = ''
  lastSearchedQuery.value = ''
  searched.value = false
  resultsByPharmacy.value = emptyResults()
  resetWiki()
}
</script>
