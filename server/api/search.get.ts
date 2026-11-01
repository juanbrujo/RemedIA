// API endpoint for searching remedies
import { scrapeFarmex } from '../scrapers/farmex.js';
import { scrapeCurie } from '../scrapers/curie.js';
import { scrapeAhumada } from '../scrapers/ahumada.js';
import { scrapeSimi } from '../scrapers/simi.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event).q;

  if (!query) {
    return {
      error: 'Query parameter is required'
    };
  }

  try {
    // Ejecutar todos los scrapers en paralelo
    const results = await Promise.all([
      scrapeFarmex(query),
      scrapeCurie(query),
      scrapeAhumada(query),
      scrapeSimi(query)
    ]);
    return {
      query,
      results
    };
  } catch (error) {
    return {
      error: 'Failed to search remedies',
      details: typeof error === 'object' && error && 'message' in error ? error.message : String(error)
    };
  }
});
