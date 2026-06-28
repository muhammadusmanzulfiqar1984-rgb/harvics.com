import { Client } from 'pg';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const client = new Client({
      connectionString: env.HYPERDRIVE.connectionString,
    });

    await client.connect();

    // Query live HarvyX leads from Neon via Hyperdrive
    const result = await client.query(`
      SELECT 
        c.name AS company,
        c.country,
        c.industry,
        l.stage,
        l.score
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      ORDER BY l.score DESC
      LIMIT 10
    `);

    ctx.waitUntil(client.end());

    return Response.json({
      status: 'ok',
      source: 'Neon via Cloudflare Hyperdrive',
      top_leads: result.rows,
    });
  },
} satisfies ExportedHandler<Env>;
