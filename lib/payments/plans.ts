export type PricingPlanId = 'free' | 'weekly' | 'monthly';

export interface PricingPlan {
  id: PricingPlanId;
  name: string;
  badge?: string;
  priceEur: number;
  priceCents: number;
  durationDays: number;
  popular?: boolean;
  features: string[];
}

export const PRONAX_PRICING_PLANS: Record<PricingPlanId, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Falas',
    priceEur: 0,
    priceCents: 0,
    durationDays: 3,
    badge: 'Provë 3 Ditë',
    features: [
      'Publikim për 3 ditë të plota',
      'Shfaqje në kërkim & hartë gjeografike',
      'Deri në 30 fotografi me cilësi të lartë',
      'Kontakt i drejtpërdrejtë me blerësit',
      'Zero kosto (0.00 €) pa pagesë të nevojshme',
    ],
  },
  weekly: {
    id: 'weekly',
    name: 'Javore',
    priceEur: 2.99,
    priceCents: 299,
    durationDays: 7,
    badge: 'Më Ekonomike',
    features: [
      'Publikim për 7 ditë të plota',
      'Shfaqje prioritare në kërkim & hartë',
      'Deri në 30 fotografi me cilësi të lartë',
      'Mbështetje me WhatsApp & telefon',
      'Pagesë njëherëshe me Visa & Mastercard',
    ],
  },
  monthly: {
    id: 'monthly',
    name: 'Mujore',
    priceEur: 9.99,
    priceCents: 999,
    durationDays: 30,
    popular: true,
    badge: 'Më e Popullarizuara',
    features: [
      'Publikim për 30 ditë kalendarike',
      'Ekspozim maksimal në të gjithë Kosovën',
      'Shënjues i dallueshëm në hartën interaktive',
      'Statistika të shikimeve në panelin personal',
      'Pagesë njëherëshe (Pa debitim automatik)',
    ],
  },
};

export const VALID_PAID_PLAN_AMOUNTS = [299, 999]; // in EUR cents (2.99 € and 9.99 €)

export function getPlanById(planId: string): PricingPlan {
  if (planId === 'weekly') return PRONAX_PRICING_PLANS.weekly;
  if (planId === 'monthly') return PRONAX_PRICING_PLANS.monthly;
  return PRONAX_PRICING_PLANS.free;
}

export function getPlanByAmountCents(amountCents: number): PricingPlan | null {
  if (amountCents === 0) return PRONAX_PRICING_PLANS.free;
  if (amountCents === 299) return PRONAX_PRICING_PLANS.weekly;
  if (amountCents === 999) return PRONAX_PRICING_PLANS.monthly;
  return null;
}
