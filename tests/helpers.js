import { vi } from 'vitest';

// Simula fetch con una respuesta HTML o JSON. Devuelve el mock para inspeccionar las llamadas.
export function mockFetch({ html = '', json = null, ok = true, status = 200 } = {}) {
  const fn = vi.fn(async () => ({
    ok,
    status,
    text: async () => html,
    json: async () => json
  }));
  vi.stubGlobal('fetch', fn);
  return fn;
}
