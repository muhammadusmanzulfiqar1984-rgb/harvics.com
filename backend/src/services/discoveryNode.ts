import { SkuProfile } from './productSynthesizer';

// --- HARVICS ORCHESTRATOR: Discovery Node ---
// Task 1: The 'Agent-Ready' API
// Provides "Machine-Readable" product data for AI agents.

export class DiscoveryNode {
  
  public static generateAgentManifest(sku: SkuProfile, territory: string): any {
    // Generate Schema.org structured data (JSON-LD)
    // This allows AI agents (Gemini, Apple Intelligence) to instantly verify value & purpose.
    
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": sku.name,
      "description": `Harvics ${sku.flavor} in ${sku.packSize}. ${sku.reasoning}`,
      "brand": {
        "@type": "Brand",
        "name": "Harvics"
      },
      "sku": `${territory}-${sku.name.replace(/\s+/g, '-').toUpperCase()}`,
      "offers": {
        "@type": "Offer",
        "url": `https://harvics.com/products/${territory}/${sku.name.replace(/\s+/g, '-').toLowerCase()}`,
        "priceCurrency": "USD", // Normalized for AI comparison
        "price": sku.pricing.retailPrice,
        "priceValidUntil": new Date(Date.now() + 86400000).toISOString().split('T')[0], // Valid for 24h
        "availability": "https://schema.org/InStock"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Purpose Score",
          "value": sku.passport.ethicalScore,
          "maxValue": 100,
          "description": "Harvics Sovereign Integrity Score based on fair trade and ethical sourcing."
        },
        {
          "@type": "PropertyValue",
          "name": "Carbon Footprint",
          "value": sku.passport.carbonFootprint
        },
        {
          "@type": "PropertyValue",
          "name": "Origin",
          "value": sku.passport.origin
        },
        {
          "@type": "PropertyValue",
          "name": "Fair Trade Status",
          "value": sku.passport.fairTradeStatus
        }
      ]
    };
  }
}
