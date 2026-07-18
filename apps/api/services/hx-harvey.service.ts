/**
 * hx-harvey.service.ts — Harvey chat orchestration
 * Module 2 — NLP → dispatch → persist → respond
 */

import { randomUUID } from 'crypto';

import { HARVEY_SYSTEM_PROMPT } from '../prompts/harvey-system';
import { classifyMessage } from './hx-harvey-nlp';
import { dispatchIntent } from './hx-harvey-dispatch';
import {
  getOrCreateSessionState,
  mintConfirmationToken,
  saveSessionState,
} from './hx-harvey-session';
import * as harveyRepo from '../../../packages/db/repositories/hx-harvey.repository';
import type {
  HxHarveyRequest,
  HxHarveyResponse,
} from '../../../packages/types/hx-harvey.types';
import { hxLogger } from '../../../packages/lib/hx-logger';

const MODULE = 'hx-harvey.service';
const CONFIRM_RE = /^(yes|confirm|proceed|do it|approved|ok)\b/i;

export interface HarveyChatInput extends HxHarveyRequest {
  operator_id?: string | null;
  confirmation_token?: string | null;
}

async function ensurePostgresSession(
  sessionId: string,
  operatorId: string | null,
): Promise<void> {
  const existing = await harveyRepo.getSession(sessionId);
  if (existing) return;
  await harveyRepo.createSession({
    session_id: sessionId,
    operator_id: operatorId,
  });
}

async function craftReplyWithPersona(
  baseReply: string,
  intent: string,
): Promise<{ text: string; model: string }> {
  // Keep persona framing lightweight — base reply already carries facts.
  void HARVEY_SYSTEM_PROMPT;
  void intent;
  return { text: baseReply, model: 'harvey-dispatch' };
}

export async function handleHarveyChat(
  input: HarveyChatInput,
): Promise<HxHarveyResponse> {
  const started = Date.now();
  const sessionId = input.session_id?.trim() || randomUUID();
  const operatorId = input.operator_id ?? null;
  const message = (input.message ?? '').trim();

  if (!message) {
    return {
      reply: 'Send a command. Example: "Data Bank summary" or "Find apparel buyers in GB with ICP 85+".',
      intent: 'unknown',
      confidence: 1,
      entities: [],
      actions_taken: [],
      requires_confirmation: false,
      confirmation_token: null,
      model_used: 'harvey-guard',
      latency_ms: Date.now() - started,
    };
  }

  await ensurePostgresSession(sessionId, operatorId);
  const state = await getOrCreateSessionState({
    session_id: sessionId,
    operator_id: operatorId,
  });

  await harveyRepo.addMessage({
    session_id: sessionId,
    role: 'user',
    content: message,
  });

  // Confirmation path — operator approved a pending mutating action
  const isConfirm =
    Boolean(input.confirmation_token) || CONFIRM_RE.test(message);

  if (
    isConfirm &&
    state.pending_confirmation &&
    (!input.confirmation_token ||
      input.confirmation_token === state.pending_confirmation.token)
  ) {
    const pending = state.pending_confirmation;
    const dispatched = await dispatchIntent({
      intent: pending.intent,
      entities: state.last_entities,
      message,
      confirmed: true,
    });

    state.pending_confirmation = null;
    state.turn_count += 1;
    state.last_intent = pending.intent;
    await saveSessionState(state);

    await harveyRepo.updateSession(sessionId, {
      last_intent: pending.intent,
      turn_count: state.turn_count,
    });

    const { text, model } = await craftReplyWithPersona(
      dispatched.reply,
      pending.intent,
    );

    const latency = Date.now() - started;
    await harveyRepo.addMessage({
      session_id: sessionId,
      role: 'assistant',
      content: text,
      intent: pending.intent,
      confidence: 1,
      entities: state.last_entities,
      actions_taken: dispatched.actions_taken,
      requires_confirmation: false,
      confirmed: true,
      model_used: model,
      latency_ms: latency,
    });

    if (dispatched.actions_taken.length) {
      for (const action of dispatched.actions_taken) {
        await harveyRepo.addAction({
          session_id: sessionId,
          action_type: String(action['type'] ?? pending.intent),
          payload: pending.payload,
          result: action,
          status: 'completed',
        });
      }
    }

    return {
      reply: text,
      intent: pending.intent,
      confidence: 1,
      entities: state.last_entities,
      actions_taken: dispatched.actions_taken,
      requires_confirmation: false,
      confirmation_token: null,
      model_used: model,
      latency_ms: latency,
    };
  }

  const nlp = await classifyMessage(message);
  const dispatched = await dispatchIntent({
    intent: nlp.intent,
    entities: nlp.entities,
    message,
    confirmed: false,
  });

  let confirmationToken: string | null = null;
  if (dispatched.requires_confirmation) {
    confirmationToken = mintConfirmationToken();
    state.pending_confirmation = {
      token: confirmationToken,
      intent: nlp.intent,
      payload: dispatched.confirmation_payload ?? { entities: nlp.entities },
    };
  } else {
    state.pending_confirmation = null;
  }

  state.turn_count += 1;
  state.last_intent = nlp.intent;
  state.last_entities = nlp.entities;
  await saveSessionState(state);

  await harveyRepo.updateSession(sessionId, {
    last_intent: nlp.intent,
    turn_count: state.turn_count,
  });

  const { text, model } = await craftReplyWithPersona(
    dispatched.reply,
    nlp.intent,
  );

  const latency = Date.now() - started;
  const assistantMsg = await harveyRepo.addMessage({
    session_id: sessionId,
    role: 'assistant',
    content: text,
    intent: nlp.intent,
    confidence: nlp.confidence,
    entities: nlp.entities,
    actions_taken: dispatched.actions_taken,
    requires_confirmation: dispatched.requires_confirmation,
    confirmed: null,
    model_used: `${nlp.model_used}+${model}`,
    latency_ms: latency,
  });

  if (dispatched.actions_taken.length || dispatched.requires_confirmation) {
    await harveyRepo.addAction({
      message_id: assistantMsg.id,
      session_id: sessionId,
      action_type: nlp.intent,
      payload: {
        entities: nlp.entities,
        confirmation: dispatched.requires_confirmation,
      },
      result: dispatched.requires_confirmation
        ? { status: 'awaiting_confirmation' }
        : { actions: dispatched.actions_taken },
      status: dispatched.requires_confirmation ? 'pending' : 'completed',
    });
  }

  hxLogger.info(MODULE, 'chat turn complete', {
    session_id: sessionId,
    intent: nlp.intent,
    confidence: nlp.confidence,
    latency_ms: latency,
  });

  return {
    reply: text,
    intent: nlp.intent,
    confidence: nlp.confidence,
    entities: nlp.entities,
    actions_taken: dispatched.actions_taken,
    requires_confirmation: dispatched.requires_confirmation,
    confirmation_token: confirmationToken,
    model_used: `${nlp.model_used}+${model}`,
    latency_ms: latency,
  };
}
