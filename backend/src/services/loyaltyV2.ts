// --- HARVICS ORCHESTRATOR: Adaptive Loyalty Engine (V2) ---
// Task 2: The Adaptive Loyalty Engine
// AI decides incentives based on shopper 'Mission', not generic discounts.

export interface ShopperContext {
  location: string;
  searchIntent: string; // e.g., "low-sugar snacks", "party supplies"
  history?: string[];
}

export interface LoyaltyOffer {
  sku: string;
  discountType: 'Introductory Margin' | 'Volume Kicker' | 'Loyalty Gift';
  discountValue: string;
  reasoning: string;
}

export class LoyaltyV2 {

  public static analyzeShopperMission(context: ShopperContext): LoyaltyOffer | null {
    console.log(`[LoyaltyV2] Analyzing mission for shopper in ${context.location}: "${context.searchIntent}"`);

    const intent = context.searchIntent.toLowerCase();

    // SCENARIO 1: Health Conscious in London
    // Example: "low-sugar snacks" -> Harvics Dark @ 10% Intro Margin
    if (context.location === 'London' && (intent.includes('sugar') || intent.includes('healthy') || intent.includes('diet'))) {
      return {
        sku: 'Harvics Dark Selection',
        discountType: 'Introductory Margin',
        discountValue: '10% OFF',
        reasoning: 'Mission: Health-conscious discovery. Strategy: Lower barrier to entry for premium dark SKU.'
      };
    }

    // SCENARIO 2: Bulk Buyer in Lagos
    // Example: "party" or "bulk" -> Volume Kicker
    if (context.location === 'Lagos' && (intent.includes('party') || intent.includes('bulk') || intent.includes('family'))) {
      return {
        sku: 'Harvics Family Pack',
        discountType: 'Volume Kicker',
        discountValue: 'Buy 5 Get 1 Free',
        reasoning: 'Mission: High-volume event. Strategy: Incentivize bulk purchase to capture market share.'
      };
    }

    // SCENARIO 3: Tech Worker in Dubai
    // Example: "energy" or "late night" -> Loyalty Gift
    if (context.location === 'Dubai' && (intent.includes('energy') || intent.includes('focus') || intent.includes('work'))) {
      return {
        sku: 'Harvics Energy Snap',
        discountType: 'Loyalty Gift',
        discountValue: 'Free Sample with Coffee',
        reasoning: 'Mission: Productivity boost. Strategy: Cross-promotion with caffeine habits.'
      };
    }

    return null;
  }
}
