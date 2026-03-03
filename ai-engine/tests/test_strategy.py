from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_strategy_endpoint_returns_plan():
    payload = {
        'countryCode': 'PK',
        'macroData': {
            'population': 240_000_000,
            'gdpPerCapita': 1600,
            'logisticsComplexity': 7
        },
        'gpsCoverageScore': 48,
        'tradeFlows': {
            'hsCodes': [
                {'hsCode': '2202', 'description': 'Beverages', 'importValueUSD': 120_000_000, 'exportValueUSD': 80_000_000}
            ]
        },
        'procurementMap': {
            'rawMaterials': [
                {'material': 'Sugar', 'risk': 'high'}
            ]
        }
    }

    response = client.post('/strategy', json=payload)
    assert response.status_code == 200
    data = response.json()['data']
    assert data['marketScore'] > 0
    assert data['priceBand'] in {'premium', 'mid-tier', 'value'}
    assert isinstance(data['recommendedSkus'], list)
