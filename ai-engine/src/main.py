from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Any, Dict

from models.strategy import build_strategy


class StrategyRequest(BaseModel):
    countryCode: str
    macroData: Dict[str, Any] = Field(default_factory=dict)
    gpsCoverageScore: float = 0
    tradeFlows: Dict[str, Any] = Field(default_factory=dict)
    procurementMap: Dict[str, Any] = Field(default_factory=dict)


app = FastAPI(title='Harvics AI Strategy Engine', version='0.1.0')


@app.get('/health')
def health() -> Dict[str, str]:
    return {'status': 'ok', 'service': 'ai-strategy-engine'}


@app.post('/strategy')
def strategy(payload: StrategyRequest):
    plan = build_strategy(payload.dict())
    return {
        'success': True,
        'data': {
            'country': payload.countryCode.upper(),
            **plan
        }
    }
