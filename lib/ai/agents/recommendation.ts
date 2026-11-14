/**
 * PronaX AI — AGENT 8: Personalized Property Recommendation Agent
 * Sugjeron prona të ngjashme reale sipas preferencave dhe lokacionit
 */

export interface PropertyTarget {
  id: string;
  title: string;
  municipality: string;
  propertyType: string;
  listingType: 'shitje' | 'qira';
  price: number;
  bedrooms?: number;
  areaM2?: number;
}

export interface RecommendationResult {
  propertyId: string;
  score: number; // 0 - 100
  reason: string;
}

export class RecommendationAgent {
  static readonly agentId = 'recommendation';

  /**
   * Përllogarit ngjashmërinë midis pronës reference dhe listës së pronave kandidate
   */
  static findSimilar(
    target: PropertyTarget,
    candidates: PropertyTarget[],
    limit = 4
  ): RecommendationResult[] {
    const scored: RecommendationResult[] = [];

    for (const candidate of candidates) {
      if (candidate.id === target.id) continue;
      // Duhet të përputhet tipi i shitjes/qirasë
      if (candidate.listingType !== target.listingType) continue;

      let score = 0;
      const reasons: string[] = [];

      // 1. Lokacioni (Komuna)
      if (candidate.municipality === target.municipality) {
        score += 40;
        reasons.push('Ndodhet në të njëjtin qytet');
      }

      // 2. Lloji i pronës
      if (candidate.propertyType === target.propertyType) {
        score += 30;
        reasons.push(`Është gjithashtu ${target.propertyType}`);
      }

      // 3. Çmimi brenda +/- 25%
      const priceDiff = Math.abs(candidate.price - target.price);
      const priceRatio = priceDiff / (target.price || 1);
      if (priceRatio <= 0.25) {
        score += 20;
        reasons.push('Interval i përafërt çmimi');
      }

      // 4. Numri i dhomave
      if (target.bedrooms && candidate.bedrooms && candidate.bedrooms === target.bedrooms) {
        score += 10;
        reasons.push(`${target.bedrooms} dhoma gjumi`);
      }

      if (score >= 40) {
        scored.push({
          propertyId: candidate.id,
          score,
          reason: reasons.join(', '),
        });
      }
    }

    // Rendit sipas pikëve më të larta
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }
}
