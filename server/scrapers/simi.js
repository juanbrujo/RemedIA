// Scraper para Farmacias del Dr. Simi (drsimi.cl), tienda VTEX con API de catalogo publica
const BASE = 'https://www.drsimi.cl';

// 26990 -> "$26.990"
const formatCLP = (n) => `$${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

export async function scrapeSimi(query) {
  try {
    const url = `${BASE}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&_from=0&_to=23`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
        'Referer': `${BASE}/`
      }
    });
    // VTEX responde 206 (contenido parcial) cuando hay mas paginas
    if (!response.ok) throw new Error('No se pudo acceder a Dr. Simi');
    const products = await response.json();
    const results = [];
    for (const p of Array.isArray(products) ? products : []) {
      const item = p.items?.[0];
      const offer = item?.sellers?.[0]?.commertialOffer;
      if (!p.productName || !p.linkText || !offer || !(offer.Price > 0)) continue;
      results.push({
        titulo: p.productName.trim(),
        laboratorio: (p.brand || '').trim(),
        precio: formatCLP(offer.Price),
        imagen: item.images?.[0]?.imageUrl || '',
        link: `${BASE}/${p.linkText}/p`,
        status: offer.AvailableQuantity > 0 ? '' : 'Agotado',
        oferta: offer.ListPrice > offer.Price ? 'Oferta' : ''
      });
    }
    return { pharmacy: 'Dr. Simi', results };
  } catch (error) {
    return { pharmacy: 'Dr. Simi', results: [], error: error.message };
  }
}
