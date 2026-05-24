// API endpoint for searching remedies
import { scrapeFarmex } from '../scrapers/farmex.js';
import { scrapeCurie } from '../scrapers/curie.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event).q;

  if (!query) {
    return {
      error: 'Query parameter is required'
    };
  }

  try {
    // Ejecutar ambos scrapers en paralelo
    const [farmexResults, curieResults] = await Promise.all([
      scrapeFarmex(query),
      scrapeCurie(query)
    ]);
    return {
      query,
      results: [farmexResults, curieResults]
    };
  } catch (error) {
    return {
      error: 'Failed to search remedies',
      details: typeof error === 'object' && error && 'message' in error ? error.message : String(error)
    };
  }
});
