import fs from 'fs';
import path from 'path';
import { GlobalDataInflow } from './globalDataInflow';
import { HarvicsAlphaEngine } from './harvicsAlphaEngine';
import { AlertService } from './alertService';

// --- HARVICS PROFIT SENTINEL ---
// High-Frequency Background Agent for Margin Protection

interface SentinelState {
  lastInflation: Record<string, number>;
  lastRun: Date;
}

export class ProfitSentinel {
  private static INTERVAL_MS = 60000; // 60 seconds
  private static TARGET_TERRITORIES = ['GB', 'US', 'PK', 'AE']; // UK, US, Pakistan, UAE
  private static LOG_FILE = path.join(__dirname, '../../logs/AlphaHistory.json');

  // State to track inflation changes
  private static state: SentinelState = {
    lastInflation: {},
    lastRun: new Date()
  };

  public static start() {
    console.log('[ProfitSentinel] 🛡️ Sentinel System Activated. Monitoring heartbeat...');
    
    // Initial Run
    this.runCycle();

    // Heartbeat
    setInterval(() => {
      this.runCycle();
    }, this.INTERVAL_MS);
  }

  private static async runCycle() {
    console.log(`[ProfitSentinel] Heartbeat Check: ${new Date().toLocaleTimeString()}`);
    
    for (const country of this.TARGET_TERRITORIES) {
      await this.monitorTerritory(country);
    }
  }

  private static async monitorTerritory(countryCode: string) {
    try {
      // 1. Pull Live Data
      const economicData = await GlobalDataInflow.getEconomicData(countryCode);
      const capitalCity = this.getCapital(countryCode);
      const weatherData = await GlobalDataInflow.getWeather(capitalCity);

      // 2. Decision Logic: Inflation Spike
      const previousInflation = this.state.lastInflation[countryCode] || economicData.inflation;
      const inflationDiff = economicData.inflation - previousInflation;

      // Update state
      this.state.lastInflation[countryCode] = economicData.inflation;

      if (inflationDiff > 0.02) {
        await this.handleInflationSpike(countryCode, economicData.inflation, previousInflation);
      }

      // 3. Decision Logic: Weather Urgency
      if (weatherData.tempCelsius > 35) {
        await this.handleHeatWave(countryCode, weatherData.tempCelsius);
      }

    } catch (error) {
      console.error(`[ProfitSentinel] Error monitoring ${countryCode}:`, error);
    }
  }

  private static async handleInflationSpike(country: string, current: number, previous: number) {
    const message = `Inflation in ${country} spiked by ${(current - previous).toFixed(2)}% (Current: ${current}). Triggering AlphaEngine recalculation.`;
    await AlertService.sendProfitAlert(message);

    // Trigger AlphaEngine
    await HarvicsAlphaEngine.generateDailyAttackPlan([country]);

    // Log Event
    this.logEvent({
      type: 'INFLATION_SPIKE',
      country,
      details: `Inflation moved from ${previous} to ${current}`,
      action: 'AlphaEngine Recalculated Prices'
    });
  }

  private static async handleHeatWave(country: string, temp: number) {
    // "Energy Sachet" logic
    // We calculate a simulated price surge for the alert
    const basePrice = 0.80; // Approximate base
    const surgePrice = (basePrice * 1.15).toFixed(2);

    const message = `High Heat (${temp}°C) in ${country}. "Energy Sachet" SKUs flagged for 15% price surge due to urgency. New Target: $${surgePrice}`;
    await AlertService.sendProfitAlert(message);

    this.logEvent({
      type: 'WEATHER_URGENCY',
      country,
      details: `Temp ${temp}°C > 35°C`,
      action: `Energy Sachet Price Surge to $${surgePrice} (+15%)`
    });
  }

  private static logEvent(event: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      ...event
    };

    try {
      let history = [];
      if (fs.existsSync(this.LOG_FILE)) {
        const content = fs.readFileSync(this.LOG_FILE, 'utf-8');
        if (content.trim()) {
            history = JSON.parse(content);
        }
      }
      history.push(entry);
      fs.writeFileSync(this.LOG_FILE, JSON.stringify(history, null, 2));
    } catch (err) {
      console.error('[ProfitSentinel] Logging failed:', err);
    }
  }

  private static getCapital(code: string): string {
    const capitals: Record<string, string> = {
      'US': 'Washington', 'PK': 'Islamabad', 'AE': 'Dubai', 'GB': 'London', 'IN': 'New Delhi', 'CN': 'Beijing'
    };
    return capitals[code] || 'London';
  }
}
