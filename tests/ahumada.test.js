import { describe, it, expect, afterEach, vi } from 'vitest';
import { scrapeAhumada } from '../server/scrapers/ahumada.js';
import { mockFetch } from './helpers.js';

const tile = ({ title = 'Paracetamol 500 mg x 16 Comprimidos', href = '/paracetamol-84574.html', brand = 'Chile', sales = '$618', strike = '', unavailable = 'false' } = {}) => `
  <div class="product product-tile-wrapper" data-pid="84574"><div class="product-tile">
    <div class="image-container"><a href="${href}"><img class="tile-image" src="https://www.farmaciasahumada.cl/img/84574.jpg"></a></div>
    <div class="tile-body">
      <div class="preccio-fracionado-wrapper"><span class="preccio-fracionado">$ 82 x Comp.</span></div>
      <div class="product-tile-brand"><span class="link">${brand}</span></div>
      <div class="pdp-link"><a class="link" href="${href}">${title}</a></div>
      <div class="price">
        <span class="default-price"><span class="sales"><div class="promotion-badge-container"> ${sales} </div></span></span>
        ${strike ? `<del><span class="strike-through list"><span class="value">${strike}</span></span></del>` : ''}
      </div>
    </div>
    <div class="tile-cta"><button class="product-tile-add-to-cart" data-is-unavailable="${unavailable}">Agregar</button></div>
  </div></div>`;

afterEach(() => vi.unstubAllGlobals());

describe('scrapeAhumada', () => {
  it('extrae título, marca, precio, imagen y link absoluto', async () => {
    mockFetch({ html: tile() });
    const { pharmacy, results } = await scrapeAhumada('paracetamol');
    expect(pharmacy).toBe('Farmacias Ahumada');
    expect(results).toEqual([{
      titulo: 'Paracetamol 500 mg x 16 Comprimidos',
      laboratorio: 'Chile',
      precio: '$618',
      imagen: 'https://www.farmaciasahumada.cl/img/84574.jpg',
      link: 'https://www.farmaciasahumada.cl/paracetamol-84574.html',
      status: '',
      oferta: ''
    }]);
  });

  it('no confunde el precio fraccionado ("$ 82 x Comp.") con el precio del producto', async () => {
    mockFetch({ html: tile({ sales: '$7.490' }) });
    expect((await scrapeAhumada('x')).results[0].precio).toBe('$7.490');
  });

  it('marca Oferta cuando hay precio tachado', async () => {
    mockFetch({ html: tile({ strike: '$1.309' }) });
    expect((await scrapeAhumada('x')).results[0].oferta).toBe('Oferta');
  });

  it('marca Agotado cuando el botón indica no disponible', async () => {
    mockFetch({ html: tile({ unavailable: 'true' }) });
    expect((await scrapeAhumada('x')).results[0].status).toBe('Agotado');
  });

  it('ignora productos sin precio', async () => {
    mockFetch({ html: tile({ sales: '' }) + tile({ title: 'Con precio', sales: '$990' }) });
    const { results } = await scrapeAhumada('x');
    expect(results.map(r => r.titulo)).toEqual(['Con precio']);
  });

  it('devuelve el error y resultados vacíos si el sitio responde mal', async () => {
    mockFetch({ ok: false, status: 500 });
    const res = await scrapeAhumada('x');
    expect(res.results).toEqual([]);
    expect(res.error).toBe('No se pudo acceder a Farmacias Ahumada');
  });
});
