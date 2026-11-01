// Scraper para Farmacias Ahumada (farmaciasahumada.cl)
import * as cheerio from 'cheerio';

const BASE = 'https://www.farmaciasahumada.cl';

export async function scrapeAhumada(query) {
  try {
    const url = `${BASE}/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
        'Referer': `${BASE}/`
      }
    });
    if (!response.ok) throw new Error('No se pudo acceder a Farmacias Ahumada');
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];
    // Cada producto es un .product-tile-wrapper (Salesforce Commerce Cloud)
    $('.product-tile-wrapper').each((_, el) => {
      const $tile = $(el);
      const $a = $tile.find('.pdp-link a').first();
      if ($a.length === 0) return;

      const titulo = $a.text().trim();
      let link = $a.attr('href') || '';
      if (link && !link.startsWith('http')) link = `${BASE}${link}`;

      const laboratorio = $tile.find('.product-tile-brand').first().text().trim();

      // Precio vigente: primer $ dentro de .sales (el precio "normal" va en <del>)
      const precioText = $tile.find('.price .sales').first().text();
      const precio = (precioText.match(/\$\s?[\d.]+/) || [''])[0].replace(/\s/g, '');

      const imagen = $tile.find('img.tile-image').first().attr('src') || '';

      const status = $tile.find('.product-tile-add-to-cart').attr('data-is-unavailable') === 'true' ? 'Agotado' : '';
      const oferta = $tile.find('.price del .strike-through').length > 0 ? 'Oferta' : '';

      if (titulo && link && precio) {
        results.push({
          titulo,
          laboratorio,
          precio,
          imagen,
          link,
          status,
          oferta
        });
      }
    });
    return { pharmacy: 'Farmacias Ahumada', results };
  } catch (error) {
    return { pharmacy: 'Farmacias Ahumada', results: [], error: error.message };
  }
}
