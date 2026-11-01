import { describe, it, expect, afterEach, vi } from 'vitest';
import { scrapeSimi } from '../server/scrapers/simi.js';
import { mockFetch } from './helpers.js';

const product = ({ name = 'Paracetamol 500 mg 16 comprimidos', brand = 'ANDRÓMACO', slug = 'paracetamol-500-mg', price = 480, list = 480, qty = 99999 } = {}) => ({
  productName: name,
  brand,
  linkText: slug,
  items: [{
    images: [{ imageUrl: 'https://farmaciasdeldrsimicl.vteximg.com.br/arquivos/ids/1/a.jpg' }],
    sellers: [{ commertialOffer: { Price: price, ListPrice: list, AvailableQuantity: qty } }]
  }]
});

afterEach(() => vi.unstubAllGlobals());

describe('scrapeSimi', () => {
  it('mapea el catálogo VTEX al formato común', async () => {
    mockFetch({ json: [product()] });
    const { pharmacy, results } = await scrapeSimi('paracetamol');
    expect(pharmacy).toBe('Dr. Simi');
    expect(results).toEqual([{
      titulo: 'Paracetamol 500 mg 16 comprimidos',
      laboratorio: 'ANDRÓMACO',
      precio: '$480',
      imagen: 'https://farmaciasdeldrsimicl.vteximg.com.br/arquivos/ids/1/a.jpg',
      link: 'https://www.drsimi.cl/paracetamol-500-mg/p',
      status: '',
      oferta: ''
    }]);
  });

  it.each([
    [480, '$480'],
    [7890, '$7.890'],
    [26990, '$26.990'],
    [1234567, '$1.234.567'],
    [1199.6, '$1.200']
  ])('formatea %s como %s', async (price, expected) => {
    mockFetch({ json: [product({ price, list: price })] });
    expect((await scrapeSimi('x')).results[0].precio).toBe(expected);
  });

  it('marca Oferta cuando el precio de lista es mayor que el precio', async () => {
    mockFetch({ json: [product({ price: 790, list: 1090 })] });
    expect((await scrapeSimi('x')).results[0].oferta).toBe('Oferta');
  });

  it('marca Agotado cuando no hay stock', async () => {
    mockFetch({ json: [product({ qty: 0 })] });
    expect((await scrapeSimi('x')).results[0].status).toBe('Agotado');
  });

  it('ignora productos sin precio o sin oferta comercial', async () => {
    mockFetch({ json: [product({ price: 0, list: 0 }), { productName: 'Sin items', linkText: 'x', items: [] }, product({ name: 'Válido' })] });
    expect((await scrapeSimi('x')).results.map(r => r.titulo)).toEqual(['Válido']);
  });

  it('tolera una respuesta que no es un arreglo', async () => {
    mockFetch({ json: { error: 'algo' } });
    expect((await scrapeSimi('x')).results).toEqual([]);
  });

  it('codifica la búsqueda en la URL', async () => {
    const fetchMock = mockFetch({ json: [] });
    await scrapeSimi('ácido fólico');
    expect(fetchMock.mock.calls[0][0]).toContain(`ft=${encodeURIComponent('ácido fólico')}`);
  });

  it('devuelve el error y resultados vacíos si el sitio responde mal', async () => {
    mockFetch({ ok: false, status: 503 });
    const res = await scrapeSimi('x');
    expect(res.results).toEqual([]);
    expect(res.error).toBe('No se pudo acceder a Dr. Simi');
  });
});
