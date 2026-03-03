import { IntelligenceNode } from '../services/intelligenceNode';
import { IntelligenceContext } from '../types/intelligence.types';

const mockTransaction: IntelligenceContext = {
  traceId: 'TRX-001-TEST',
  sales: {
    opportunityId: 'OPP-101',
    demandType: 'Contract',
    productCategory: 'Electronics',
    volume: 5000,
    targetPrice: 100,
    urgency: 'High'
  },
  buyer: {
    buyerId: 'BUY-999',
    erpIntegrationStatus: 'Active',
    creditScore: 85,
    paymentHistory: { averageDelayDays: 2, defaultRisk: 5 }
  },
  procurement: {
    rfqId: 'RFQ-202',
    sourcingStatus: 'Negotiating',
    negotiatedMargin: 0.18,
    contractReadiness: 90
  },
  suppliers: [
    {
      supplierId: 'SUP-A',
      liveCapacity: 6000,
      productionQueueDays: 10,
      qaPassRate: 95,
      sustainabilityRating: 80
    },
    {
      supplierId: 'SUP-B',
      liveCapacity: 2000,
      productionQueueDays: 5,
      qaPassRate: 88,
      sustainabilityRating: 60
    }
  ],
  operations: {
    logisticsRouteStatus: 'Open',
    warehouseCapacity: 10000,
    inspectionAvailability: true,
    freightCostIndex: 40
  },
  finance: {
    cashflowStatus: 'Positive',
    currencyExposure: 50000,
    creditLimitAvailable: 1000000,
    sanctionsMatch: false
  },
  localisation: {
    countryCode: 'AE',
    tradeBarrierScore: 20,
    complianceComplexity: 'Medium',
    legalReviewRequired: false,
    requiredCertifications: []
  },
  external: {
    marketPriceIndex: 98,
    commodityTrend: 'Neutral',
    weatherRisk: 10,
    geopoliticalAlerts: [],
    bankLiquidityStatus: 'High'
  }
};

async function runTest() {
  try {
    const decision = await IntelligenceNode.processTransaction(mockTransaction);
    console.log('--- INTELLIGENCE OUTPUT ---');
    console.log(JSON.stringify(decision, null, 2));
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

runTest();
