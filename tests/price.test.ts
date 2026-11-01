import { describe, it, expect } from 'vitest'
import { priceValue } from '../app/utils/price'

describe('priceValue', () => {
  it('convierte precios con punto de miles (Farmex, Ahumada, Simi)', () => {
    expect(priceValue('$25.790')).toBe(25790)
    expect(priceValue('$1.234.567')).toBe(1234567)
  })

  it('convierte precios con coma de miles (Curie)', () => {
    expect(priceValue('$15,500')).toBe(15500)
  })

  it('convierte precios sin separador', () => {
    expect(priceValue('$990')).toBe(990)
  })

  it('devuelve Infinity cuando no hay precio válido', () => {
    expect(priceValue('')).toBe(Infinity)
    expect(priceValue(undefined)).toBe(Infinity)
    expect(priceValue(null)).toBe(Infinity)
    expect(priceValue('Agotado')).toBe(Infinity)
  })

  it('ordena de menor a mayor y deja los sin precio al final', () => {
    const items = [{ precio: '$25.790' }, { precio: '' }, { precio: '$15,500' }, { precio: '$990' }, { precio: '$7.890' }]
    const sorted = [...items].sort((a, b) => priceValue(a.precio) - priceValue(b.precio))
    expect(sorted.map(i => i.precio)).toEqual(['$990', '$7.890', '$15,500', '$25.790', ''])
  })
})
