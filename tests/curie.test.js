import { describe, it, expect, afterEach, vi } from 'vitest';
import { scrapeCurie } from '../server/scrapers/curie.js';
import { mockFetch } from './helpers.js';

const card = ({ title = 'Paracetamol Comprimidos 500mg\n', href = '/products/paracetamol-500mg', price = '$600 CLP', badge = '' } = {}) => `
  <div id="product-grid"><div class="product-card">
    <a class="product-card__image" href="${href}"><img src="//www.farmaciascurie.cl/cdn/x.jpg"></a>
    <div class="product-card__heading">${title}</div>
    <div class="price"><div>${price}</div></div>
    ${badge ? `<span class="badge">${badge}</span>` : ''}
  </div></div>`;

afterEach(() => vi.unstubAllGlobals());

describe('scrapeCurie', () => {
  it('extrae título limpio, precio sin "CLP", imagen y link absolutos', async () => {
    mockFetch({ html: card() });
    const { pharmacy, results } = await scrapeCurie('paracetamol');
    expect(pharmacy).toBe('Farmacias Curie');
    expect(results).toEqual([{
      titulo: 'Paracetamol Comprimidos 500mg',
      precio: '$600',
      link: 'https://www.farmaciascurie.cl/products/paracetamol-500mg',
      imagen: 'https://www.farmaciascurie.cl/cdn/x.jpg',
      status: ''
    }]);
  });

  it('expone el texto del badge como status', async () => {
    mockFetch({ html: card({ badge: ' Agotado ' }) });
    expect((await scrapeCurie('x')).results[0].status).toBe('Agotado');
  });

  it('ignora tarjetas sin precio', async () => {
    mockFetch({ html: card({ price: '' }) });
    expect((await scrapeCurie('x')).results).toEqual([]);
  });

  it('devuelve el error y resultados vacíos si el sitio responde mal', async () => {
    mockFetch({ ok: false, status: 429 });
    const res = await scrapeCurie('x');
    expect(res.results).toEqual([]);
    expect(res.error).toBe('No se pudo acceder a Farmacias Curie');
  });
});
