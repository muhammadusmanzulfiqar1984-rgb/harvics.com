import { ProductSynthesisEngine } from '../src/services/productSynthesizer';
import { IntelligenceNode } from '../src/services/intelligenceNode';

const testCountries = ['US', 'PK', 'AE', 'GB'];

console.log('--- SOVEREIGN ARCHITECT: SYSTEM DIAGNOSTIC ---');

async function runDiagnostics() {
  for (const code of testCountries) {
    console.log(`\n--------------------------------------------------`);
    console.log(`Analyzing Territory: ${code}`);
    const vector = await IntelligenceNode.analyzeTerritory(code);
    
    if (vector) {
      console.log(`[VECTOR] Purchasing Power: ${vector.economic.purchasingPower}`);
      console.log(`[VECTOR] Void Score: ${vector.competitive.marketVoidScore}`);
      console.log(`[VECTOR] Real-Time Temp: ${vector.environmental.realTimeTemp}°C`);
      
      const sku = await ProductSynthesisEngine.generateSku(code);
      
      if (sku) {
        console.log(`[SYNTHESIS] Generated SKU: ${sku.name}`);
        console.log(`[SYNTHESIS] Visual DNA: ${sku.visualVibe}`);
        console.log(`[FINANCE] Margin: ${sku.pricing.netMargin}`);
        console.log(`[FINANCE] Retail Price: $${sku.pricing.retailPrice}`);
        console.log(`[PASSPORT] Origin: ${sku.passport.origin}`);
      } else {
        console.log(`[SYNTHESIS] No Viable SKU (Margin/Void Guardrail Triggered)`);
      }
    } else {
      console.log(`[ERROR] No Intelligence Data for ${code}`);
    }
  }
}

runDiagnostics();
