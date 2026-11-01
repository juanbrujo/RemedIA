// "$25.790" (Farmex) o "$15,500" (Curie) -> 25790. Sin precio válido va al final al ordenar.
export const priceValue = (precio: unknown): number => {
  const n = parseInt(String(precio ?? '').replace(/\D/g, ''), 10)
  return Number.isNaN(n) ? Infinity : n
}
