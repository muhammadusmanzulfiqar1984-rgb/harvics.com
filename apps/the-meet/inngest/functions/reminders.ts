/**
 * Inngest functions — wire when INNGEST_EVENT_KEY is set.
 * Reminder: T-24h / T-1h before scheduledAt.
 * Follow-up: after meeting ends → AI summary email.
 */

export const meetReminderStub = {
  id: 'meet-reminder',
  name: 'Meeting reminder',
}

export const meetFollowUpStub = {
  id: 'meet-follow-up',
  name: 'Post-meeting follow-up',
}
