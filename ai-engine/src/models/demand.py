from typing import Dict


def forecast_demand(macro_data: Dict) -> float:
    population_m = macro_data.get('population', 50_000_000) / 1_000_000
    gdp_per_capita = macro_data.get('gdpPerCapita', 5000)
    logistics = macro_data.get('logisticsComplexity', 5)

    base = (population_m * 1.5) + (gdp_per_capita / 2000)
    adjustment = max(1, 10 - logistics)
    demand_index = base * (adjustment / 5)
    return round(min(120, max(10, demand_index)), 2)
