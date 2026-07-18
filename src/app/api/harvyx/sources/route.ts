import { NextResponse } from 'next/server';
import sourcesData from '@/data/harvyx/source-library.json';

type Source = {
  name: string;
  enabled: boolean;
  mode: string;
  category?: string;
  envKey?: string;
  description?: string;
};

const ENV_BY_NAME: Record<string, string> = {
  'Google Places': 'GOOGLE_PLACES_API_KEY',
  Apollo: 'APOLLO_API_KEY',
  PhantomBuster: 'PHANTOMBUSTER_API_KEY',
  Hunter: 'HUNTER_API_KEY',
  Serper: 'SERPER_API_KEY',
  Firecrawl: 'FIRECRAWL_API_KEY',
  Instantly: 'INSTANTLY_API_KEY',
  SendGrid: 'SENDGRID_API_KEY',
  Gemini: 'GEMINI_API_KEY',
  Groq: 'GROQ_API_KEY',
};

function hasKey(envName: string) {
  const v = process.env[envName];
  return Boolean(v && v.trim() && !v.includes('your-') && v !== 'changeme');
}

export async function GET() {
  const sources = (sourcesData as Source[]).map((s) => {
    const envKey = s.envKey || ENV_BY_NAME[s.name];
    const keyPresent = envKey ? hasKey(envKey) : false;

    let mode = s.mode;
    let status: 'live' | 'key_needed' | 'catalog' | 'off' = 'catalog';

    if (!s.enabled) {
      status = 'off';
    } else if (envKey) {
      if (keyPresent) {
        mode = 'wired';
        status = 'live';
      } else {
        mode = 'wired';
        status = 'key_needed';
      }
    } else if (s.mode === 'wired') {
      status = 'key_needed';
    } else {
      status = 'catalog';
    }

    return {
      ...s,
      mode,
      envKey: envKey || null,
      keyPresent,
      status,
    };
  });

  return NextResponse.json({
    sources,
    linkedinAutomation: sources.filter((s) => s.category === 'linkedin_automation'),
  });
}
