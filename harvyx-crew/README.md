# Harvyx Crew Bot

CrewAI-powered luxury travel research bot for HARVYX. Runs as a Python microservice alongside the HarvyX Express server.

## Stack
- **LLM**: Groq (`llama-3.3-70b-versatile`)
- **Framework**: CrewAI (sequential multi-agent)
- **API**: FastAPI on port 8000

## Agents
1. **Luxury Travel Researcher** — flights, hotels, dining, experiences
2. **Luxury Itinerary Planner** — day-by-day schedule with logistics
3. **Harvyx Concierge** — client-ready proposal in HARVYX voice

## Setup

```bash
cd harvyx-crew
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
python main.py
```

## API

### POST /api/crew/travel
```json
{
  "request": "5 days in Tokyo for a couple, luxury, private experiences",
  "traveller_profile": {
    "name": "Mr Al Rashidi",
    "preferences": "privacy, fine dining, cultural immersion",
    "budget": "ultra-premium"
  }
}
```

Returns a markdown travel proposal.

## Integration with HarvyX

Call from the HarvyX Express server or Next.js API routes:
```
POST http://localhost:8000/api/crew/travel
```
