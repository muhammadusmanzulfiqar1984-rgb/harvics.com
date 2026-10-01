/**
 * Approval gate for all HARVYX send actions.
 * Rules:
 *  1. The user's message must contain an explicit approval phrase.
 *  2. At most ONE send is processed per message (prevents accidental bulk fire).
 */

const APPROVAL_PHRASES = [
  'approve',
  'approved',
  'send it',
  'go ahead',
  'yes send',
  'confirm send',
  'do it',
  'proceed',
  'confirmed',
];

export type ApprovalResult =
  | { ok: true }
  | { ok: false; reason: string };

/** Returns ok:true only when the user message contains an explicit approval phrase. */
export function checkApproval(userMessage: string): ApprovalResult {
  const lower = userMessage.toLowerCase();
  const found = APPROVAL_PHRASES.find((p) => lower.includes(p));
  if (found) return { ok: true };
  return {
    ok: false,
    reason:
      `This action requires your explicit approval. Reply with one of: ` +
      `"approve", "send it", "go ahead", "yes send", or "confirm send".`,
  };
}

/** Tracks whether a send has already fired this message turn (one-per-message limit). */
export class SendBudget {
  private used = 0;

  consume(): ApprovalResult {
    if (this.used > 0) {
      return {
        ok: false,
        reason: 'Only one send action is allowed per message. Use a separate message for the next send.',
      };
    }
    this.used++;
    return { ok: true };
  }
}
