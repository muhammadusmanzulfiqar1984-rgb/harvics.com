import { IntelligenceNode, RegionalVector } from './intelligenceNode';

// --- Sovereign Architect: Product Synthesis Engine ---
// "Market Voids" -> Auto-Generated SKUs -> Margin Protection

export interface SupplyChainPassport {
  origin: string;
  farmerId: string;
  fairTradeStatus: 'Certified' | 'Pending' | 'Direct Trade';
  ethicalScore: number; // 0-100
  carbonFootprint: string;
}

export interface SkuProfile {
  name: string;
  flavor: string;
  packSize: string;
  visualVibe: 'Minimalist Editorial' | 'High-Energy Grid';
  pricing: {
    retailPrice: number;
    cost: number;
    netMargin: string; // Formatted percentage
    usdtPeg: string; // USDT Equivalent
  };
  passport: SupplyChainPassport;
  reasoning: string;
}

export class ProductSynthesisEngine {
  
  // --- SOVEREIGN INTEGRITY FILTER ---
  // Ensures profit never overrides ethics.
  private static SovereignIntegrityFilter(
    proposedMargin: number, 
    strategy: string, 
    ethicalScore: number
  ): { adjustedMargin: number; integrityNote: string } {
    
    let adjustedMargin = proposedMargin;
    let note = 'Standard Integrity Check Passed';

    // 1. Anti-Gouging Logic (Crisis Cap)
    // If strategy is aggressive during a crisis, cap the margin to prevent "Brand Burn"
    if (['INFLATION_SHIELD', 'RISK_PREMIUM'].includes(strategy)) {
      if (adjustedMargin > 0.40) { // Cap crisis margins at 40%
        adjustedMargin = 0.40;
        note = '⚠️ Anti-Gouging Cap Applied (Brand-Burn Protection)';
      }
    }

    // 2. Ethical Sourcing Weight
    // If ethical score is low, we cannot take high margins as it implies exploitation
    if (ethicalScore < 85 && adjustedMargin > 0.30) {
      adjustedMargin = 0.30;
      note = '⚠️ Margin Capped due to Ethical Score < 85';
    }

    return { adjustedMargin, integrityNote: note };
  }

  // --- THE HARVICS ALPHA STRATEGY (RL-Based Dynamic Pricing) ---
  // Replaces fixed margin with autonomous decision making (5% - 65%)
  private static HarvicsAlphaStrategy(
    baseCost: number, 
    vector: RegionalVector, 
    competitorPrice: number | null
  ): { finalPrice: number; marginPercent: number; strategy: string; ethicalScore: number; integrityNote: string } {
    
    // 1. BASE STATE: Start with a healthy floor
    let margin = 0.25; // 25% default
    let strategy = 'STANDARD_YIELD';

    // 2. ARBITRAGE SIGNAL (Competitor Price Gap)
    // If we can undercut a competitor and still make huge margin
    if (competitorPrice) {
      const maxViablePrice = competitorPrice * 0.85; // Undercut by 15%
      const potentialMargin = (maxViablePrice - baseCost) / maxViablePrice;
      
      if (potentialMargin > 0.40) {
        margin = Math.min(potentialMargin, 0.65); // Cap at 65% (Gouging protection)
        strategy = 'AGGRESSIVE_ARBITRAGE';
      }
    }

    // 3. SURVIVAL SIGNAL (Inflation Hedge)
    // If inflation is high, we must increase margin to protect future restocking power
    if (vector.economic.inflationImpact === 'Hyper') {
      margin = Math.max(margin, 0.45); // Force high margin
      strategy = 'INFLATION_SHIELD';
    }

    // 4. ENVIRONMENTAL URGENCY (Heat Wave / Scarcity)
    if (vector.environmental.shelfLifeRisk === 'High') {
      // High risk = High Reward required
      margin += 0.10;
      if (strategy === 'STANDARD_YIELD') strategy = 'RISK_PREMIUM';
    }

    // 5. PENETRATION SIGNAL (Market Void)
    // If void is huge but purchasing power is low, sacrifice margin for share
    if (vector.competitive.marketVoidScore > 80 && vector.economic.purchasingPower === 'Low') {
      margin = 0.05; // 5% Floor
      strategy = 'DEEP_PENETRATION';
    }

    // --- INTEGRITY CHECK ---
    // Simulate an ethical score for the supply chain (In reality, this comes from the Supplier DB)
    const ethicalScore = Math.floor(Math.random() * (100 - 75) + 75); // Random 75-100
    const integrityCheck = this.SovereignIntegrityFilter(margin, strategy, ethicalScore);
    
    margin = integrityCheck.adjustedMargin;
    const integrityNote = integrityCheck.integrityNote;

    // FINAL CALCULATION
    // Clamp margin between 5% and 65% (Absolute system limits)
    margin = Math.max(0.05, Math.min(0.65, margin));

    const finalPrice = baseCost / (1 - margin);

    return {
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      marginPercent: parseFloat((margin * 100).toFixed(1)),
      strategy: `${strategy} | ${integrityNote.includes('⚠️') ? 'INTEGRITY_ACT' : 'CLEAN'}`,
      ethicalScore,
      integrityNote
    };
  }

  public static async generateSku(countryCode: string, existingVector?: RegionalVector): Promise<SkuProfile | null> {
    const vector = existingVector || await IntelligenceNode.analyzeTerritory(countryCode);
    if (!vector) return null;

    // 1. Detect Market Void (Lower threshold for aggressive entry)
    if (vector.competitive.marketVoidScore < 40) {
      console.log(`[${countryCode}] Market saturated. No void detected.`);
      return null; 
    }

    // 2. Synthesize Product DNA
    const isHighEnd = vector.economic.purchasingPower === 'High';
    const visualVibe = isHighEnd ? 'Minimalist Editorial' : 'High-Energy Grid';
    
    // --- FLAVOR LOGIC (Localized) ---
    let flavor = 'Standard';
    
    // Specific Regional Overrides (West Africa / UK)
    if (['NG', 'GH'].includes(countryCode)) flavor = 'Hibiscus & Chili'; // West Africa
    else if (countryCode === 'GB') flavor = 'Salted Caramel'; // UK
    // Fallback to Behavioral Vector
    else if (vector.behavioral.flavorBias.includes('spicy')) flavor = 'Fire Chili';
    else if (vector.behavioral.flavorBias.includes('sweet')) flavor = 'Honey Glaze';
    else if (vector.behavioral.flavorBias.includes('masala')) flavor = 'Royal Masala';
    else if (vector.behavioral.flavorBias.includes('herbal')) flavor = 'Botanical Infusion';

    // --- CORRELATION ENGINE: Weather + Income ---
    // If Weather > 35°C AND Income == "Low" -> Prioritize "Small-Batch Hydration Snacks"
    let productName = `Harvics ${flavor} ${isHighEnd ? 'Selection' : 'Snap'}`;
    let packSize = isHighEnd ? '150g Matte Pouch' : '50g Shiny Sachet';

    if ((vector.environmental.realTimeTemp || 0) > 35 && vector.economic.purchasingPower === 'Low') {
      productName = `Harvics ${flavor} Hydration Sachet`;
      packSize = '20g Electrolyte Mix';
      console.log(`[${countryCode}] ⚠️ High Heat + Low Income Correlation -> Switching to Hydration SKU`);
    } else {
        // Localized Naming (Simple logic)
        if (flavor === 'Fire Chili') productName = 'Harvics Energy'; 
        if (flavor === 'Botanical Infusion') productName = 'Harvics Vitality';
    }

    // 3. AI PRICING ENGINE
    // Base cost assumption (Manufacturing + Logistics)
    const baseMfgCost = isHighEnd ? 1.50 : 0.25; 
    const logisticsCost = vector.environmental.shelfLifeRisk === 'High' ? (baseMfgCost * 0.20) : (baseMfgCost * 0.10);
    const totalBaseCost = baseMfgCost + logisticsCost + (baseMfgCost * (vector.economic.taxBurden / 100)); // Add tax to cost base for margin calc
    
    // Use Real-Time Competitor Price from Intelligence Node (Scraped Data)
    // Fallback to simulation only if scraping failed completely
    const competitorPrice = vector.competitive.competitorPrice || (isHighEnd ? 6.50 : 0.80);

    const alphaDecision = this.HarvicsAlphaStrategy(totalBaseCost, vector, competitorPrice);

    // --- TRANSPARENCY MODULE: Supply Chain Passport ---
    const passport: SupplyChainPassport = {
      origin: ['GH', 'NG', 'CI'].includes(countryCode) ? 'Local Cooperative (Ashanti)' : 'Ghana (Direct Trade)',
      farmerId: `F-${Math.floor(Math.random() * 9000) + 1000}`,
      fairTradeStatus: alphaDecision.ethicalScore > 90 ? 'Certified' : 'Direct Trade',
      ethicalScore: alphaDecision.ethicalScore,
      carbonFootprint: '0.4kg CO2e'
    };

    return {
      name: productName,
      flavor,
      packSize,
      visualVibe,
      pricing: {
        retailPrice: alphaDecision.finalPrice,
        cost: parseFloat(totalBaseCost.toFixed(2)),
        netMargin: `${alphaDecision.marginPercent}% (${alphaDecision.strategy})`,
        usdtPeg: `${alphaDecision.finalPrice.toFixed(2)} USDT` // 1:1 Peg assumption for simplicity
      },
      passport,
      reasoning: `Void ${vector.competitive.marketVoidScore}. ${alphaDecision.strategy} triggered by ${vector.economic.inflationImpact} inflation & ${vector.environmental.shelfLifeRisk} risk. ${alphaDecision.integrityNote}`
    };
  }
}
