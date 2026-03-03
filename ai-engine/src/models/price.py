from typing import Dict, Tuple


def determine_price_band(macro_data: Dict) -> Tuple[str, str]:
    gdp_per_capita = macro_data.get('gdpPerCapita', 6000)
    inflation = macro_data.get('inflation', 8)

    if gdp_per_capita >= 30000:
        band = 'premium'
        narrative = 'Lean into premium packs and gifting occasions.'
    elif gdp_per_capita >= 10000:
        band = 'mid-tier'
        narrative = 'Balance value bundles with premium hero SKUs.'
    else:
        band = 'value'
        narrative = 'Drive sachet economics and affordability.'

    if inflation > 12:
        narrative += ' Hedge inflation via lightweight packs.'

    return band, narrative
