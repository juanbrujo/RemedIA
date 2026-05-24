// Scraper para Farmex (farmex.cl)
import * as cheerio from 'cheerio';

export async function scrapeFarmex(query) {
  try {
    const url = `https://farmex.cl/search?q=-tag:delete+-tag:persistente+${encodeURIComponent(query)}&ai=true&key=ai_search_results_1779574210643&options%5Bprefix%5D=last`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; remedios-finder/1.0)'
      }
    });
    if (!response.ok) throw new Error('No se pudo acceder a Farmex');
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];
    // Buscar todos los h3 con <a> adentro (estructura de Farmex)
    $('h3').each((_, el) => {
      const $heading = $(el);
      const $a = $heading.find('a').first();
      if ($a.length === 0) return;
      const titulo = $a.text().trim();
      let link = $a.attr('href') || '';
      if (link && !link.startsWith('http')) link = `https://farmex.cl${link}`;

      // Buscar imagen: puede estar dentro del heading o en el siguiente hermano
      let precio = '';
      let laboratorio = '';
      let imagen = '';
      let oferta = '';
      let status = '';
      // .price__badge-sold-out
      let next = $heading.next();
      let prev = $heading.prev();
      let parent = $heading.parent();
      while (prev && prev.length && !prev.text().trim()) prev = prev.prev();
      if (prev && prev.length) {
        // Laboratorio: buscar patrones comunes de laboratorio
        const prevText = prev.text();
        laboratorio = prevText
        // Buscar patrón ![...](url)
        const mdImg = parent.parents('.grid__item').find('img').attr('src');

        if (mdImg && mdImg.length) {
          imagen = mdImg.replace(' 370w', '');
          if (imagen && !imagen.startsWith('http')) imagen = `https:${imagen}`;
        }
      }
      // El precio está en el siguiente nodo de texto (hermano)
      // Saltar nodos vacíos
      while (next && next.length && !next.text().trim()) next = next.next();
      if (next && next.length) {
        const nextText = next.text();
        // Precio
        const priceMatch = nextText.match(/\$[\d\.]+/g);
        if (priceMatch && priceMatch.length > 0) precio = priceMatch[0];
        // Status
        status = next.find('.price--sold-out .price__badge-sold-out').text().includes('Agotado') ? 'Agotado' : '';
        // Oferta
        oferta = next.find('.price--on-sale .price__badge-sale').text().includes('Oferta') ? 'Oferta' : '';
      }
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
