from typing import Dict, Any

from .demand import forecast_demand
from .price import determine_price_band
from .sku import recommend_skus
from .coverage import analyze_coverage


def build_strategy(payload: Dict[str, Any]) -> Dict[str, Any]:
  macro_data = payload.get('macroData', {})
  trade_flows = payload.get('tradeFlows', {})
  procurement_map = payload.get('procurementMap', {})
  gps_score = payload.get('gpsCoverageScore', 50)

  demand_index = forecast_demand(macro_data)
  price_band, price_narrative = determine_price_band(macro_data)
  sku_recs = recommend_skus(macro_data, procurement_map)
  coverage = analyze_coverage(gps_score, trade_flows)

  market_score = round((demand_index * 0.35) + (coverage['coverageScore'] * 0.45) + (len(sku_recs) * 2), 2)

  return {
    'marketScore': market_score,
    'priceBand': price_band,
    'priceNarrative': price_narrative,
    'recommendedSkus': sku_recs,
    'focusRegions': coverage['focusRegions'],
    'competitorPressure': coverage['competitorPressure'],
    'coverageGaps': coverage['gapType'],
    'aiNarrative': f"{price_band.title()} positioning with demand index {demand_index}. Focus on {', '.join(coverage['focusRegions'])}."
  }
