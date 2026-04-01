# HARVICS OS — COPILOT INSTRUCTIONS
# READ THIS BEFORE DOING ANYTHING IN THIS WORKSPACE

## WHO YOU ARE WORKING WITH
This is HARVICS OS — a universal enterprise platform covering 10 industry verticals.
Owner: Shah Tabraiz. Every session must read HARVICS_OS_MASTER_SPEC.md before acting.

## ABSOLUTE RULES — NEVER VIOLATE

1. NEVER delete, overwrite, or "clean up" any backup file
2. NEVER refactor architecture without explicit instruction
3. NEVER rename domains, routes, or module folders
4. NEVER touch prisma/schema.prisma without explicit instruction + migration plan
5. NEVER create new files if an existing file can be edited
6. NEVER add features not explicitly requested
7. ALWAYS read HARVICS_OS_MASTER_SPEC.md before starting any task
8. ALWAYS do ONE task per session — do it completely — stop
9. ALWAYS run `npx tsc --skipLibCheck --noEmit` after any backend change
10. ALWAYS update HARVICS_OS_MASTER_SPEC.md current state section after completing a task

## DO NOT TOUCH LIST
- backend/backups/ — entire folder, never modify
- prisma/schema.prisma — read only unless migration explicitly ordered
- ai-engine/src/models/ — working AI models, do not modify
- backend/src/services/ — existing services, only add do not change
- src/app/[locale]/os/ — OS shell structure, do not restructure

## TECH STACK
- Frontend: Next.js 14, TypeScript, Tailwind CSS, App Router
- Backend: Node.js, Express, TypeScript, Prisma ORM
- Database: SQLite (dev) → PostgreSQL (production)
- AI Engine: Python FastAPI (ai-engine/)
- Auth: JWT with expiry, bcrypt passwords
- Ports: Frontend 3000, Backend 4000, AI Engine 8001

## CURRENT SYSTEM STATE
See HARVICS_OS_MASTER_SPEC.md for full details.

## HOW TO START EACH SESSION
1. Read HARVICS_OS_MASTER_SPEC.md
2. Confirm which task you are doing
3. Do only that task
4. Update the spec
5. Stop
