# Data Ocean

## Layers

### Bronze
Raw source ingestion, append-only.

### Silver
Cleaned, normalised and deduplicated.

### Gold
Analytics-ready and AI-ready feature tables.

## Source classes in the Soul specification

- FX
- weather
- cultural/religious calendar
- commodity pricing
- sanctions
- competitor intelligence
- consumer behaviour
- HS codes
- regulatory data

Each source record should carry source metadata, timestamps and freshness context.

## Module contract

```text
Transactional event
→ Data Ocean ingestion
→ normalisation
→ feature/read model
→ AI
```

Data Ocean does not replace transactional domain systems.
