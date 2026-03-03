from typing import Dict, List


def analyze_coverage(gps_score: float, trade_flows: Dict) -> Dict:
    hs_codes: List[Dict] = trade_flows.get('hsCodes', [])  # type: ignore
    trade_intensity = len(hs_codes)

    coverage = max(10.0, min(100.0, gps_score))
    if trade_intensity > 6:
        coverage += 5

    if coverage < 40:
        gap_type = 'frontier'
        focus_regions = ['North Corridor', 'Rural Belts']
    elif coverage < 70:
        gap_type = 'expansion'
        focus_regions = ['Tier-2 Cities', 'Omni-channel hubs']
    else:
        gap_type = 'optimize'
        focus_regions = ['Modern trade reset', 'Dark store densification']

    competitor_pressure = 'high' if trade_intensity > 6 else 'medium' if trade_intensity > 3 else 'low'

    return {
        'coverageScore': round(coverage, 2),
        'gapType': gap_type,
        'focusRegions': focus_regions,
        'competitorPressure': competitor_pressure
    }
