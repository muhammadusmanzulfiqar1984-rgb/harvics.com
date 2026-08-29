# FIN knowledge base (Intercom)

## Two-layer model (V3.0)

| Layer | File | Load into Fin Content? |
|-------|------|------------------------|
| **Master Business KB** | [`FIN_V3_MASTER.md`](./FIN_V3_MASTER.md) | **No** — trainers + Guidance source |
| **Production KB** | [`FIN_V3_PRODUCTION.md`](./FIN_V3_PRODUCTION.md) | **Yes** — one article per **PROD-XXX** |
| System prompt | §34 in Master + Guidance in training pack | **Fin → Guidance** |
| Proposed 72 modules | [`FIN_72_MODULES_PROPOSED.md`](./FIN_72_MODULES_PROPOSED.md) | Not as official fact until controlled |
| Prior versions | V1 / V2 Master / Batch 01 | Superseded for upload; keep for history |
| Site ops / URLs | [`../intercom-fin-training.md`](../intercom-fin-training.md), [`../intercom-fin-content-library.md`](../intercom-fin-content-library.md) | Guidance + merge into Production over time |

### Load order (production)
1. **Fin → Guidance** — paste updated Guidance from `intercom-fin-training.md` (V3 §34).  
2. **Fin → Content** — create **one Help Center article per PROD-XXX** in `FIN_V3_PRODUCTION.md`.  
3. Do **not** upload the Master V3.0 file as a single mega-article.  
4. Do **not** publish 72 modules as confirmed until official tech spec is signed.  
5. Sync Production rows when product catalogue / module list / Truth Status changes.

### Future pipeline
`Visitor → FIN → Intent → Qualify → CRM → Harvics OS → Data Ocean → Harvey AI → BI`
