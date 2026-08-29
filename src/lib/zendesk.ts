/**
 * Zendesk Support — harvicsglobalventures.zendesk.com
 * Widget key + bot id from Zendesk Admin → Channels → Web Widget
 */
export const ZENDESK_WIDGET_KEY =
  process.env.NEXT_PUBLIC_ZENDESK_WIDGET_KEY || 'c2b1f373-2c6f-411f-8fb4-03da27f0114c'

export const ZENDESK_BOT_ID =
  process.env.NEXT_PUBLIC_ZENDESK_BOT_ID || '6a922950435c5b7f8f179503'

export const ZENDESK_SUBDOMAIN =
  process.env.NEXT_PUBLIC_ZENDESK_SUBDOMAIN || 'harvicsglobalventures'

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@harvicsglobalventures.zendesk.com'

export const ZENDESK_HELP_CENTER_URL = `https://${ZENDESK_SUBDOMAIN}.zendesk.com/hc`

export function zendeskWidgetEnabled(): boolean {
  return Boolean(ZENDESK_WIDGET_KEY?.trim())
}
