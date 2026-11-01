import { describe, it, expect, afterEach, vi } from 'vitest';
import { scrapeFarmex } from '../server/scrapers/farmex.js';
import { mockFetch } from './helpers.js';

const card = ({ title = 'Paracetamol 500 mg', href = '/products/paracetamol?_pos=1', vendor = 'OPKO', price = '', priceClass = 'price' } = {}) => `
  <li class="grid__item"><div class="card-wrapper"><div class="card">
    <div class="card__media"><img src="//farmex.cl/cdn/shop/x.jpg?width=533"></div>
    <div class="card__information">
      <div class="product__vendor">${vendor}</div>
      <div class="card-information">${price ? `<div class="${priceClass}">${price}</div>` : ''}</div>
      <h3 class="card__heading h5"><a href="${href}"> ${title} </a></h3>
    </div>
  </div></div></li>`;

const regularPrice = (n) => `<div class="price__regular"><span class="price-item price-item--regular">${n}</span></div>
  <div class="price__sale"><span class="price-item price-item--sale price-item--last"> ${n} </span></div>`;

const salePrice = (now, before) => `<div class="price__regular"><span class="price-item price-item--regular">${now}</span></div>
  <div class="price__sale"><span class="price-item price-item--sale price-item--last"> ${now} </span>
  <small class="price-item price-item--regular"> ${before} </small></div>`;

afterEach(() => vi.unstubAllGlobals());

describe('scrapeFarmex', () => {
  it('extrae título, laboratorio, precio, imagen y link absolutos', async () => {
    mockFetch({ html: card({ price: regularPrice('$790') }) });
    const { pharmacy, results } = await scrapeFarmex('paracetamol');
    expect(pharmacy).toBe('Farmex');
    expect(results).toEqual([{
      titulo: 'Paracetamol 500 mg',
      laboratorio: 'OPKO',
      precio: '$790',
      imagen: 'https://farmex.cl/cdn/shop/x.jpg?width=533',
      link: 'https://farmex.cl/products/paracetamol?_pos=1',
      status: '',
      oferta: ''
    }]);
  });

  it('usa el precio vigente y marca Oferta cuando está en oferta', async () => {
    mockFetch({ html: card({ price: salePrice('$790', '$1.090'), priceClass: 'price price--on-sale' }) });
    const [item] = (await scrapeFarmex('x')).results;
    expect(item.precio).toBe('$790');
    expect(item.oferta).toBe('Oferta');
  });

  it('marca Agotado cuando el precio está agotado', async () => {
    mockFetch({ html: card({ price: regularPrice('$790'), priceClass: 'price price--sold-out' }) });
    expect((await scrapeFarmex('x')).results[0].status).toBe('Agotado');
  });

  it('ignora tarjetas sin precio (categorías)', async () => {
    mockFetch({ html: card({ title: 'Fiebre' }) + card({ price: regularPrice('$990') }) });
    const { results } = await scrapeFarmex('x');
    expect(results).toHaveLength(1);
    expect(results[0].precio).toBe('$990');
  });

  it('codifica la búsqueda en la URL', async () => {
    const fetchMock = mockFetch({ html: '' });
    await scrapeFarmex('ácido fólico');
    expect(fetchMock.mock.calls[0][0]).toContain(encodeURIComponent('ácido fólico'));
  });

  it('devuelve el error y resultados vacíos si el sitio responde mal', async () => {
    mockFetch({ ok: false, status: 429 });
    const res = await scrapeFarmex('x');
    expect(res.results).toEqual([]);
    expect(res.error).toBe('No se pudo acceder a Farmex');
  });

  it('devuelve el error si fetch falla', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down'); }));
    const res = await scrapeFarmex('x');
    expect(res).toEqual({ pharmacy: 'Farmex', results: [], error: 'network down' });
  });
});
