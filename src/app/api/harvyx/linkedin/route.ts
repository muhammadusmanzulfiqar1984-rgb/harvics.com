import { NextResponse } from 'next/server';
import { getLinkedInStatus } from '@/lib/harvyx/linkedinAutomation';

export const dynamic = 'force-dynamic';

/** GET — LinkedIn connection status for HarvyX (PhantomBuster + session cookie). */
export async function GET() {
  const status = getLinkedInStatus();
  return NextResponse.json({
    ...status,
    setup: {
      steps: [
        'Create a PhantomBuster account and install LinkedIn Auto Connect + Message Sender phantoms',
        'Copy PHANTOMBUSTER_API_KEY and each agent ID into .env.local',
        'Log into LinkedIn in Chrome → DevTools → Application → Cookies → linkedin.com → copy li_at value',
        'Set LINKEDIN_SESSION_COOKIE=li_at=... in .env.local and restart npm run dev',
      ],
      envKeys: [
        'PHANTOMBUSTER_API_KEY',
        'PHANTOMBUSTER_CONNECT_AGENT_ID',
        'PHANTOMBUSTER_DM_AGENT_ID',
        'LINKEDIN_SESSION_COOKIE',
      ],
    },
  });
}
