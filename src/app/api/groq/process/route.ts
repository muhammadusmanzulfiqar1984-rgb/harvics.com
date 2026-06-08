// Delegate to the canonical /api/groq handler to avoid duplicated logic.
// All behaviour, env checks, and auth guard live in ../route.ts.
export { POST, runtime } from '../route';
