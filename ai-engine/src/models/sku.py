from typing import Dict, List


BASE_SKUS = [
    {'name': 'Harvics Energy 250ml', 'channel': 'modern trade'},
    {'name': 'Harvics Energy 90ml', 'channel': 'traditional'},
    {'name': 'Goal Bubble Gum 5 PKR', 'channel': 'impulse'},
    {'name': 'Harvics Wafer 75g', 'channel': 'modern trade'},
    {'name': 'Glacier Hydration 330ml', 'channel': 'on-premise'}
]


def recommend_skus(macro_data: Dict, procurement_map: Dict) -> List[str]:
    ecommerce = macro_data.get('ecommercePenetration', 15)
    climate = macro_data.get('climate', 'temperate')
    materials = procurement_map.get('rawMaterials', [])
    critical_materials = [mat for mat in materials if mat.get('risk') == 'high']

    recs = []
    for sku in BASE_SKUS:
        if sku['channel'] == 'modern trade' and ecommerce < 8:
            recs.append(sku['name'])
        elif sku['channel'] == 'traditional':
            recs.append(sku['name'])
        elif sku['channel'] == 'impulse' and climate in {'tropical', 'desert'}:
            recs.append(sku['name'])
        elif sku['channel'] == 'on-premise' and ecommerce > 10:
            recs.append(sku['name'])

    if critical_materials:
        recs.append(f'Protect supply: {critical_materials[0].get("material", "Core SKU")}')

    return list(dict.fromkeys(recs))
