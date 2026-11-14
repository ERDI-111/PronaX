/**
 * PronaX AI — AGENT 4: Smart Property Search Agent
 * Konverton kërkesat me gjuhë natyrore në filtra të strukturuar për Kosovën
 */

import { SearchFilters } from '../types';
import { KOSOVO_MUNICIPALITIES } from '@/lib/locations/kosovo-data';

export class SmartSearchAgent {
  static readonly agentId = 'smart_search';

  static parseQuery(query: string): SearchFilters {
    const q = query.toLowerCase().trim();

    // 1. Zbulimi i Komunës së Kosovës
    let matchedMunicipality: string | undefined;
    for (const m of KOSOVO_MUNICIPALITIES) {
      const mName = m.name.toLowerCase();
      const mId = m.id.toLowerCase();
      if (q.includes(mName) || q.includes(mId) || q.includes(mId.replace('-', ' '))) {
        matchedMunicipality = m.id;
        break;
      }
    }

    // Përputhje shtesë fonetike (Pejë/Peja, Prishtinë/Prishtina, Prizren/Prizreni, etj.)
    if (!matchedMunicipality) {
      if (q.includes('prishtin')) matchedMunicipality = 'prishtine';
      else if (q.includes('prizren')) matchedMunicipality = 'prizren';
      else if (q.includes('pej')) matchedMunicipality = 'peje';
      else if (q.includes('ferizaj')) matchedMunicipality = 'ferizaj';
      else if (q.includes('gjilan')) matchedMunicipality = 'gjilan';
      else if (q.includes('gjakov')) matchedMunicipality = 'gjakove';
      else if (q.includes('mitrovic')) matchedMunicipality = 'mitrovice-jugut';
      else if (q.includes('fushe kosov') || q.includes('fushë kosov')) matchedMunicipality = 'fushe-kosove';
      else if (q.includes('lipjan')) matchedMunicipality = 'lipjan';
      else if (q.includes('podujev')) matchedMunicipality = 'podujeve';
    }

    // 2. Zbulimi i Llojit të Pronës
    let propertyType: string | undefined;
    if (q.includes('banes') || q.includes('apartament') || q.includes('flat')) propertyType = 'banese';
    else if (q.includes('shtep') || q.includes('vil') || q.includes('house')) propertyType = 'shtepi';
    else if (q.includes('tok') || q.includes('truall') || q.includes('plac') || q.includes('land')) propertyType = 'toke';
    else if (q.includes('lokal') || q.includes('zyr') || q.includes('komercial') || q.includes('office')) propertyType = 'lokal';
    else if (q.includes('garazh') || q.includes('parking')) propertyType = 'garazhe';

    // 3. Zbulimi i Destinimit (Shitje vs Qira)
    let listingType: 'shitje' | 'qira' = 'shitje';
    if (q.includes('qira') || q.includes('qera') || q.includes('rent')) {
      listingType = 'qira';
    }

    // 4. Zbulimi i Çmimit (nën X euro, deri në X euro, etj.)
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    // Rregull për: "nën 80000", "nen 80,000", "deri 80 mijë", "under 300"
    const underMatch = q.match(/(?:nën|nen|deri|under|less than|max)\s*(\d+[\d.,]*)\s*(?:mij[eë]|k|000)?/i);
    if (underMatch) {
      let valStr = underMatch[1].replace(/[,.]/g, '');
      let val = parseInt(valStr, 10);
      if (q.includes('mij') || q.includes(' k ') || q.endsWith('k')) {
        if (val < 1000) val *= 1000;
      }
      if (val > 0) maxPrice = val;
    }

    // Rregull për: "mbi 500", "fillon nga 50000"
    const overMatch = q.match(/(?:mbi|fillon nga|over|more than|min)\s*(\d+[\d.,]*)\s*(?:mij[eë]|k|000)?/i);
    if (overMatch) {
      let valStr = overMatch[1].replace(/[,.]/g, '');
      let val = parseInt(valStr, 10);
      if (q.includes('mij') || q.includes(' k ') || q.endsWith('k')) {
        if (val < 1000) val *= 1000;
      }
      if (val > 0) minPrice = val;
    }

    // 5. Zbulimi i Dhomave
    let minRooms: number | undefined;
    const roomMatch = q.match(/(\d+)\s*(?:dhom|dhoma|room|bedrooms)/i);
    if (roomMatch) {
      minRooms = parseInt(roomMatch[1], 10);
    }

    // 6. Karakteristika shtesë
    const hasParking = q.includes('parking') || q.includes('garazh');
    const hasElevator = q.includes('ashensor') || q.includes('lift');
    const hasBalcony = q.includes('ballkon') || q.includes('terac');

    return {
      municipality: matchedMunicipality,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      minRooms,
      hasParking,
      hasElevator,
      hasBalcony,
      confidence: matchedMunicipality || propertyType || maxPrice ? 0.95 : 0.6,
      originalQuery: query,
    };
  }
}
