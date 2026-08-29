# Platform Spine

## Target structure

```text
Experience
→ Edge / Access
→ Shared Core
→ OS Domains
→ HPay
→ Universe
→ Intelligence Fabric
→ External Integrations
```

## Architecture style

The production blueprint requires:

> Modular monolith first → evented integration second → selective service extraction third.

Do not create a microservice per module on day one.

## Shared services

- Identity / MFA
- RBAC / ABAC
- Tenant context
- Localisation
- Tax
- FX
- Audit
- Notifications
- Documents
- Search
- Workflow jobs
- Feature flags
- Observability

## Domain rule

Each domain owns its models, services, controllers, policies, events and tests. No domain reaches directly into another domain's private files.
