# RemedIA 💊

🔒 Repositorio privado.

RemedIA es una aplicación Nuxt 4 para buscar y comparar precios de remedios en varias farmacias chilenas, con un diseño moderno y responsivo.

## Funcionalidades

- Búsqueda en paralelo en **Farmex**, **Farmacias Curie**, **Farmacias Ahumada** y **Dr. Simi**.
- Resultados de cada farmacia ordenados de menor a mayor precio.
- Chips bajo el buscador para mostrar u ocultar farmacias (solo filtran lo que se ve).
- Tarjeta completa clicable hacia el producto en el sitio de la farmacia, con etiquetas de oferta y agotado sobre la imagen.
- Buscador de una línea, fijo (sticky) arriba, con scroll suave a los resultados.
- Descripción del remedio desde Wikipedia en un modal.
- Botones para buscar directamente en **Salcobrand** y **Cruz Verde** (ver [Farmacias](#farmacias)).
- PWA (solo online, sin caché offline).

## Farmacias

| Farmacia | Cómo se obtienen los datos | Archivo |
| --- | --- | --- |
| Farmex | HTML de `farmex.cl/search` (tarjetas `.card-wrapper`) | `server/scrapers/farmex.js` |
| Farmacias Curie | HTML de `farmaciascurie.cl/search` | `server/scrapers/curie.js` |
| Farmacias Ahumada | HTML de `farmaciasahumada.cl/search` (`.product-tile-wrapper`) | `server/scrapers/ahumada.js` |
| Dr. Simi | API pública de catálogo de VTEX (`/api/catalog_system/pub/products/search`) | `server/scrapers/simi.js` |
| Salcobrand | Solo enlace a su búsqueda | `app/pages/index.vue` (`externalLinks`) |
| Cruz Verde | Solo enlace a su búsqueda | `app/pages/index.vue` (`externalLinks`) |

Salcobrand y Cruz Verde no tienen scraper porque no exponen una API pública utilizable: Salcobrand busca con una clave de Algolia restringida a su propio dominio, y la API de Cruz Verde exige una sesión. Para agregar otra farmacia solo con enlace, basta una línea en `externalLinks`.

Cada scraper devuelve `{ pharmacy, results: [{ titulo, laboratorio, precio, imagen, link, status, oferta }], error? }`. Si un sitio falla o limita las peticiones (HTTP 429), devuelve `results: []` y el mensaje en `error`, sin afectar a las demás.

## Stack

- [Nuxt 4](https://nuxt.com) y Vue 3
- [Tailwind CSS v4](https://tailwindcss.com) (`@tailwindcss/vite`), con los tokens de diseño en `app/assets/css/main.css`
- [Inspira UI](https://inspira-ui.com) (componentes copiados a `app/components/inspira/`) y [motion-v](https://motion.dev/docs/vue) para las animaciones
- [cheerio](https://cheerio.js.org) para el scraping
- [Vitest](https://vitest.dev) para los tests

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Tests

```bash
npm test          # corre la suite una vez
npm run test:watch
```

Los tests de los scrapers usan HTML y JSON de ejemplo con `fetch` simulado: no hacen peticiones a los sitios reales.

## Estructura

```
app/
  assets/css/main.css      # Tailwind v4 + tokens (@theme)
  components/              # ResultCard, PharmacyTitle, WikiModal, AppFooter
  components/inspira/ui/   # componentes de Inspira UI (SparklesText)
  pages/index.vue          # página única
  utils/price.ts           # priceValue: "$25.790" / "$15,500" -> número
server/
  api/search.get.ts        # GET /api/search?q=... (todos los scrapers en paralelo)
  scrapers/                # un scraper por farmacia
tests/                     # vitest
```

## Variables de entorno

La app no necesita variables de entorno. El archivo `.env` está ignorado por git y por Vercel (`.gitignore`, `.vercelignore`).

## Deploy en Vercel

1. Sube este repositorio a GitHub, GitLab o Bitbucket.
2. Ve a [vercel.com](https://vercel.com/) y crea un nuevo proyecto enlazando este repo.
3. Vercel detectará Nuxt automáticamente. No necesitas configuración extra.
4. El build y deploy serán automáticos en cada push a `main`.

Para configuración avanzada, revisa `vercel.json` y `.vercelignore`.

## Licencia

[MIT License](LICENSE)

---

## Disclaimer

Este proyecto es de uso personal y no tiene ninguna relación ni afiliación con Farmex, Curie, Ahumada, Dr. Simi, Salcobrand, Cruz Verde ni ninguna farmacia. Solo automatiza búsquedas públicas porque los buscadores oficiales son lentos y poco usables. No pide, almacena, vende ni distribuye datos de terceros.

- Proyecto privado, solo para uso personal.
- Respeta los límites de los sitios: no se esquivan restricciones de acceso ni se usan credenciales ajenas. Si una farmacia no ofrece una vía pública, solo se enlaza a su buscador.
- Diseño basado en [sistema de tokens](DESIGN.md) y Tailwind CSS.
