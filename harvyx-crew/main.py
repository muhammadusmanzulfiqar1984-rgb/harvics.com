import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crew import run_harvyx_crew

app = FastAPI(title="Harvyx Crew Bot", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TravelRequest(BaseModel):
    request: str
    traveller_profile: dict = {}

class TravelResponse(BaseModel):
    result: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "harvyx-crew"}

@app.post("/api/crew/travel", response_model=TravelResponse)
def travel(body: TravelRequest):
    if not body.request or not body.request.strip():
        raise HTTPException(status_code=400, detail="request is required")
    try:
        result = run_harvyx_crew(body.request, body.traveller_profile)
        return TravelResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
