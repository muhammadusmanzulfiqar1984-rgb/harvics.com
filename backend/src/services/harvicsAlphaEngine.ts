import { ProductSynthesisEngine } from './productSynthesizer';
import { IntelligenceNode } from './intelligenceNode';
import { Server } from 'socket.io';
import { DiscoveryNode } from './discoveryNode';
import { LoyaltyV2 } from './loyaltyV2';

// --- HARVICS ALPHA ENGINE: The Daily War Room ---
// Generates the "Market Attack Plan" every 24 hours based on Global Intelligence.

export interface MarketAttackEntry {
  territory: string;
  sku: string;
  strategy: string;
  targetPrice: number;
  usdtPeg: string;
  margin: string;
  alert: string;
  passport?: {
    origin: string;
    fairTradeStatus: string;
    ethicalScore: number;
  };
  agentManifest?: any;
  loyaltyOffer?: any;
}

export class HarvicsAlphaEngine {
  private static io: Server;

  public static setSocketServer(io: Server) {
    this.io = io;
  }

  // The Daily Cron Job
  public static async generateDailyAttackPlan(targetTerritories: string[]): Promise<MarketAttackEntry[]> {
    console.log(`\n=== HARVICS ALPHA: GENERATING DAILY ATTACK PLAN [${new Date().toISOString().split('T')[0]}] ===\n`);
    
    const attackPlan: MarketAttackEntry[] = [];

    for (const code of targetTerritories) {
      // 1. Ingest Real-Time Intelligence
      const vector = await IntelligenceNode.analyzeTerritory(code);
      if (!vector) continue;

      // 2. Synthesize Optimal Product
      const skuProfile = await ProductSynthesisEngine.generateSku(code, vector);

      if (skuProfile) {
        // --- ORCHESTRATOR INTEGRATION ---
        
        // Task 1: Generate Agent Manifest
        const agentManifest = DiscoveryNode.generateAgentManifest(skuProfile, code);

        // Task 2: Simulate Loyalty Context (Demo Purpose)
        // In prod, this would come from the user session, but for the "Attack Plan" simulation we pick a typical persona
        const demoContext = {
            location: code === 'GB' ? 'London' : code === 'NG' ? 'Lagos' : code === 'AE' ? 'Dubai' : 'Unknown',
            searchIntent: code === 'GB' ? 'low-sugar snacks' : code === 'NG' ? 'party bulk' : 'energy boost'
        };
        const loyaltyOffer = LoyaltyV2.analyzeShopperMission(demoContext);

        // 3. Formulate Attack Entry
        const entry: MarketAttackEntry = {
          territory: code,
          sku: skuProfile.name,
          strategy: skuProfile.pricing.netMargin.split('(')[1].replace(')', ''), // Extract strategy name
          targetPrice: skuProfile.pricing.retailPrice,
          usdtPeg: skuProfile.pricing.usdtPeg,
          margin: skuProfile.pricing.netMargin.split(' ')[0], // Extract percentage
          alert: this.generateAlert(vector, skuProfile),
          passport: skuProfile.passport,
          agentManifest,
          loyaltyOffer
        };
        
        attackPlan.push(entry);
        this.printTacticalBrief(entry);

        // Task 3: Emit Real-Time Proposal to CEO Dashboard
        if (this.io) {
            this.io.emit('market-attack-proposal', {
                ...entry,
                confidenceScore: Math.floor(Math.random() * (99 - 85) + 85), // Simulated confidence
                timestamp: new Date().toISOString()
            });
        }

      } else {
        console.log(`[${code}] HOLD POSITION. No viable entry vector detected.`);
      }
    }

    return attackPlan;
  }

  private static generateAlert(vector: any, sku: any): string {
    if (vector.economic.inflationImpact === 'Hyper') return '⚠️ INFLATION SPIKE: MARGINS BOLSTERED';
    if (vector.environmental.shelfLifeRisk === 'High') return '🔥 HEAT WAVE: LOGISTICS PREMIUM APPLIED';
    if (sku.pricing.netMargin.includes('65%')) return '💰 ARBITRAGE OPPORTUNITY DETECTED';
    if (sku.pricing.netMargin.includes('5%')) return '⚔️ MARKET GRAB: MARGIN SACRIFICED';
    return '✅ STANDARD OPERATIONS';
  }

  private static printTacticalBrief(entry: MarketAttackEntry) {
    console.log(`>> TARGET: ${entry.territory} | SKU: ${entry.sku}`);
    console.log(`   ACTION: ${entry.strategy} @ $${entry.targetPrice} [${entry.usdtPeg}]`);
    console.log(`   YIELD:  ${entry.margin} | STATUS: ${entry.alert}`);
    console.log('---------------------------------------------------');
  }
}
