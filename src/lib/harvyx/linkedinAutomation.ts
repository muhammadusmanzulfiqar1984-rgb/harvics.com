const PB_BASE = 'https://api.phantombuster.com/api/v2';

export type LinkedInConnectionStatus = {
  phantomKey: boolean;
  sessionCookie: boolean;
  connectAgentId: boolean;
  dmAgentId: boolean;
  ready: boolean;
  mode: 'phantombuster' | 'manual';
  hint: string;
};

export function getLinkedInStatus(): LinkedInConnectionStatus {
  const phantomKey = Boolean(process.env.PHANTOMBUSTER_API_KEY?.trim());
  const sessionCookie = Boolean(process.env.LINKEDIN_SESSION_COOKIE?.trim());
  const connectAgentId = Boolean(
    (process.env.PHANTOMBUSTER_CONNECT_AGENT_ID || process.env.PHANTOMBUSTER_AGENT_ID || '').trim(),
  );
  const dmAgentId = Boolean(
    (process.env.PHANTOMBUSTER_DM_AGENT_ID || process.env.PHANTOMBUSTER_AGENT_ID || '').trim(),
  );
  const ready = phantomKey && sessionCookie && connectAgentId;

  let hint = 'LinkedIn send-from-HarvyX uses PhantomBuster + your LinkedIn session (same as Waalaxy/Lusha automation).';
  if (!phantomKey) hint = 'Add PHANTOMBUSTER_API_KEY to .env.local';
  else if (!sessionCookie) hint = 'Add LINKEDIN_SESSION_COOKIE (li_at cookie from your LinkedIn login) to .env.local';
  else if (!connectAgentId) hint = 'Add PHANTOMBUSTER_CONNECT_AGENT_ID from your PhantomBuster LinkedIn Auto Connect agent';

  return {
    phantomKey,
    sessionCookie,
    connectAgentId,
    dmAgentId,
    ready,
    mode: ready ? 'phantombuster' : 'manual',
    hint,
  };
}

function normalizeLinkedInUrl(url: string) {
  const u = url.trim();
  if (!u) return '';
  if (u.startsWith('http')) return u;
  return `https://${u.replace(/^\/+/, '')}`;
}

function isLinkedInChannel(channel?: string) {
  const c = (channel || '').toLowerCase();
  return c.includes('linkedin') || c === 'linkedin_connect' || c === 'linkedin_dm';
}

function agentForChannel(channel?: string) {
  const c = (channel || '').toLowerCase();
  if (c.includes('dm') || c === 'linkedin_dm') {
    return (
      process.env.PHANTOMBUSTER_DM_AGENT_ID ||
      process.env.PHANTOMBUSTER_AGENT_ID ||
      ''
    ).trim();
  }
  return (
    process.env.PHANTOMBUSTER_CONNECT_AGENT_ID ||
    process.env.PHANTOMBUSTER_AGENT_ID ||
    ''
  ).trim();
}

export async function sendViaPhantomBuster(opts: {
  linkedinUrl: string;
  message: string;
  channel?: string;
}) {
  const status = getLinkedInStatus();
  if (!status.phantomKey) {
    return { ok: false as const, error: 'PHANTOMBUSTER_API_KEY not configured', hint: status.hint };
  }

  const agentId = agentForChannel(opts.channel);
  if (!agentId) {
    return { ok: false as const, error: 'PhantomBuster agent ID not configured', hint: status.hint };
  }

  const profileUrl = normalizeLinkedInUrl(opts.linkedinUrl);
  const sessionCookie = process.env.LINKEDIN_SESSION_COOKIE || '';
  const isDm = (opts.channel || '').toLowerCase().includes('dm');

  const argument = {
    sessionCookie,
    profileUrl,
    linkedInUrl: profileUrl,
    message: opts.message,
    connectionMessage: opts.message,
    numberOfAddsPerLaunch: 1,
    numberOfProfilesPerLaunch: 1,
    onlyFirstDegree: isDm,
  };

  const launchRes = await fetch(`${PB_BASE}/agents/launch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Phantombuster-Key-1': process.env.PHANTOMBUSTER_API_KEY!,
    },
    body: JSON.stringify({
      id: agentId,
      argument: JSON.stringify(argument),
    }),
  });

  const data = await launchRes.json().catch(() => ({}));
  if (!launchRes.ok) {
    return {
      ok: false as const,
      error: 'PhantomBuster launch failed',
      detail: data,
      hint: 'Check LINKEDIN_SESSION_COOKIE is fresh and agent ID matches your PhantomBuster phantom.',
    };
  }

  return {
    ok: true as const,
    containerId: data.containerId || data.id || null,
    raw: data,
  };
}

export async function sendLinkedInOutreach(item: {
  channel?: string;
  linkedin?: string;
  message?: string;
  target?: string;
}) {
  const linkedin = normalizeLinkedInUrl(String(item.linkedin || ''));
  const message = String(item.message || '').trim();

  if (!linkedin) {
    return {
      ok: false as const,
      mode: 'manual' as const,
      error: 'No LinkedIn URL on this contact',
      hint: 'Enrich the lead or add their LinkedIn profile URL first.',
    };
  }

  if (!isLinkedInChannel(item.channel)) {
    return { ok: false as const, error: 'Not a LinkedIn outreach item' };
  }

  const status = getLinkedInStatus();
  if (!status.ready) {
    return {
      ok: false as const,
      mode: 'manual' as const,
      error: 'LinkedIn not connected to HarvyX yet',
      hint: status.hint,
      linkedin,
      message,
    };
  }

  const result = await sendViaPhantomBuster({
    linkedinUrl: linkedin,
    message,
    channel: item.channel,
  });

  if (!result.ok) {
    return { ...result, mode: 'phantombuster' as const, linkedin, message };
  }

  return {
    ok: true as const,
    mode: 'phantombuster' as const,
    containerId: result.containerId,
    linkedin,
  };
}
