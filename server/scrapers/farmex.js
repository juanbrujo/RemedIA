// Scraper para Farmex (farmex.cl)
import * as cheerio from 'cheerio';

export async function scrapeFarmex(query) {
  try {
    const url = `https://farmex.cl/search?q=-tag:delete+-tag:persistente+${encodeURIComponent(query)}&ai=true&key=ai_search_results_1779574210643&options%5Bprefix%5D=last`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://farmex.cl/'
      }
    });
    if (!response.ok) throw new Error('No se pudo acceder a Farmex');
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];
    // Cada producto es un .card-wrapper (tema Shopify de Farmex)
    $('.card-wrapper').each((_, el) => {
      const $card = $(el);
      const $a = $card.find('h3.card__heading a').first();
      if ($a.length === 0) return;

      const titulo = $a.text().trim();
      let link = $a.attr('href') || '';
      if (link && !link.startsWith('http')) link = `https://farmex.cl${link}`;

      const laboratorio = $card.find('.product__vendor').first().text().trim();

      // .price-item--last es el precio vigente (con o sin oferta)
      const $price = $card.find('.price').first();
      const precioText = $price.find('.price-item--last').first().text() || $price.find('.price-item--regular').first().text();
      const precio = (precioText.match(/\$[\d.]+/) || [''])[0];

      let imagen = $card.find('.card__media img').first().attr('src') || '';
      if (imagen && !imagen.startsWith('http')) imagen = `https:${imagen}`;

      const status = $price.hasClass('price--sold-out') ? 'Agotado' : '';
      const oferta = $price.hasClass('price--on-sale') ? 'Oferta' : '';

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
    return { pharmacy: 'Farmex', results };
  } catch (error) {
    return { pharmacy: 'Farmex', results: [], error: error.message };
  }
}
