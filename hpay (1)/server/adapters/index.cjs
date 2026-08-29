/**
 * Interface-driven production rail adapters.
 * Re-exports createProductionProviders (Fireblocks, Circle, SWIFT/CBUAE, Chainalysis, Gemini).
 */
const { createProductionProviders } = require('../providers.cjs');

/**
 * @returns {{
 *  fireblocks: import('../providers.cjs'),
 *  circle: any,
 *  swift_cbuae: any,
 *  chainalysis: any,
 *  gemini: any,
 *  status: Function
 * }}
 */
function createRailAdapters() {
  const providers = createProductionProviders();
  return {
    ...providers,
    /** Explicit driver map for DI / testing */
    drivers: {
      FireblocksMpcVaultDriver: providers.fireblocks,
      CircleUsdcPayoutDriver: providers.circle,
      SwiftCbuaeIso20022Driver: providers.swift_cbuae,
      ChainalysisKytDriver: providers.chainalysis,
      GeminiHarveyDriver: providers.gemini,
    },
  };
}

module.exports = { createRailAdapters };
