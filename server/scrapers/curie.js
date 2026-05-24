// Scraper para Farmacias Curie (farmaciascurie.cl)
import * as cheerio from 'cheerio';

export async function scrapeCurie(query) {
  try {
    const url = `https://www.farmaciascurie.cl/search?q=${encodeURIComponent(query)}&options%5Bprefix%5D=last`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.farmaciascurie.cl/'
      }
    });
    if (!response.ok) throw new Error('No se pudo acceder a Farmacias Curie');
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    // Buscar bloques de producto por cards (cada producto tiene un link, precio, imagen, etc)
    // El selector base es un link a /products/ con texto y precio cerca, y una imagen cerca

    // $('a[href*="/products/"]').each((_, el) => {
    $('#product-grid .product-card').each((_, el) => {

      const $a = $(el);
      let link = $a.find('.product-card__image').attr('href');
      if (link && !link.startsWith('http')) link = `https://www.farmaciascurie.cl${link}`;
      // Título: texto del link, limpiando saltos y espacios
      const titulo = $a.find('.product-card__heading').text();
      // Precio: buscar en el mismo bloque, o en el texto cercano
      let precio = '';
      // Buscar span con CLP o $ cerca
      precio = $a.find('.price div:contains("$")').text().replace(' CLP', '');

      // Imagen: buscar img cerca del link
      let imagen = '';
      // Buscar img en el mismo padre o siguiente hermano
      let $img = $a.find('.product-card__image img');
      if ($img.length) {
        imagen = $img.attr('src') || '';
        if (imagen && !imagen.startsWith('http')) imagen = `https:${imagen}`;
      }
      // Status
      const status = $a.find('.badge').text();

      if (titulo && precio && link) {
        results.push({
          titulo,
          precio,
          link,
          imagen,
          status
        });
      }
    });
    return { pharmacy: 'Farmacias Curie', results };
  } catch (error) {
    return { pharmacy: 'Farmacias Curie', results: [], error: error.message };
  }
}
