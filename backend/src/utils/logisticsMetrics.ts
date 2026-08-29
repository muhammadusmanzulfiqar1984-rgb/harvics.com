/** Shared logistics KPI helpers — real data only, no hardcoded rates. */

export function computeOnTimeRate(routes: Array<{ status?: string }>): number | null {
  const completed = routes.filter((r) => r.status === 'Completed').length;
  const delayed = routes.filter((r) => r.status === 'Delayed').length;
  const terminal = completed + delayed;
  if (terminal === 0) return null;
  return Math.round((completed / terminal) * 1000) / 10;
}
