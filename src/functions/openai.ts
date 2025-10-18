import { DomainMapping, FillPlan, FormSchema, UserProfile } from '../types/index';
import { safeExtractFillPlan } from './safeExtract';
import { log } from '../utils/logger';

export type CallOpenAIArgs = {
  schema: FormSchema;
  profile?: UserProfile;
  domainMapping?: DomainMapping;
  locale: string;
  model: string;
  apiKey: string;
  temperature?: number;
  requestId?: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const callOpenAI = async (args: CallOpenAIArgs): Promise<FillPlan> => {
  // OpenAI Responses API (recommended)
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: args.apiKey });

  const system = [
    'あなたはフォーム入力の自動化エージェントです。',
    '出力は厳密にJSONスキーマに従ってください。説明文は出力しないでください。',
    '機密項目（password, card_*）はsensitive: trueとし、必ずrequiresConfirmation: trueとします。',
    '既知のドメインマッピングがあれば優先し、なければ推論します。',
    'ラベル/周辺文脈からフィールドの意味付けを行い、確信度を0-1で示してください。',
    '出力は以下のキーのみ: { formId: string, items: { fieldId, meaning, value, confidence, requiresConfirmation, sensitive }[], notes?: string[] }',
  ].join('\n');
  const user = JSON.stringify({
    locale: args.locale,
    schema: args.schema,
    hints: args.domainMapping ?? null,
    profile: args.profile ?? null,
  });
  const input = `${system}\n\n[INPUT]\n${user}`;

  const buildJsonSchema = () => ({
    name: 'fill_plan',
    schema: {
      type: 'object',
      required: ['formId', 'items'],
      properties: {
        formId: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['fieldId', 'meaning', 'value', 'confidence', 'requiresConfirmation', 'sensitive'],
            properties: {
              fieldId: { type: 'string' },
              meaning: { type: 'string' },
              value: { oneOf: [{ type: 'string' }, { type: 'boolean' }] },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              requiresConfirmation: { type: 'boolean' },
              sensitive: { type: 'boolean' },
            },
            additionalProperties: false,
          },
        },
        notes: { type: 'array', items: { type: 'string' } },
      },
      additionalProperties: false,
    },
    strict: true,
  } as const);

  const startedAt = Date.now();
  const reqPreviewBytes = (() => {
    try { return new TextEncoder().encode(input).length; } catch { return -1; }
  })();
  log.info('OpenAI request start', { requestId: args.requestId, endpoint: 'responses', model: args.model, temperature: args.temperature ?? 0, schemaFields: args.schema.fields.length, locale: args.locale, inputSizeBytes: reqPreviewBytes });

  try {
    const res = await client.responses.create({
      model: args.model,
      input,
      response_format: { type: 'json_schema', json_schema: buildJsonSchema() },
      temperature: args.temperature ?? 0,
    } as any);
    const elapsedMs = Date.now() - startedAt;
    const usage = (res as any)?.usage ?? null;
    log.info('OpenAI response meta', { requestId: args.requestId, endpoint: 'responses', status: 200, elapsedMs, usage });
    return safeExtractFillPlan(res as unknown);
  } catch (err) {
    const e = err as any;
    const status: number | undefined = e?.status ?? e?.code;
    const message: string = e?.message ?? String(e);
    log.warn('OpenAI non-OK (responses)', { requestId: args.requestId, status, message });
    // Fallback once without schema if strict schema caused 400
    if (status === 400) {
      try {
        const res2 = await client.responses.create({
          model: args.model,
          input,
          response_format: { type: 'json_object' },
          temperature: args.temperature ?? 0,
        } as any);
        const elapsed2 = Date.now() - startedAt;
        const usage2 = (res2 as any)?.usage ?? null;
        log.info('OpenAI response meta (fallback json_object)', { requestId: args.requestId, endpoint: 'responses', status: 200, elapsedMs: elapsed2, usage: usage2 });
        return safeExtractFillPlan(res2 as unknown);
      } catch (err2) {
        const ee = err2 as any;
        log.warn('OpenAI fallback failed', { requestId: args.requestId, status: ee?.status ?? ee?.code, message: ee?.message ?? String(ee) });
        throw new Error(`OpenAI API error: ${ee?.status ?? ee?.code ?? 'unknown'}`);
      }
    }
    throw new Error(`OpenAI API error: ${status ?? 'unknown'}`);
  }
};

export const callOpenAIWithRetry = async (
  args: CallOpenAIArgs,
  opts: { retries: number; initialDelayMs: number; maxDelayMs: number }
): Promise<FillPlan> => {
  let attempt = 0;
  let delayMs = opts.initialDelayMs;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      log.debug('OpenAI attempt', { requestId: args.requestId, attempt: attempt + 1 });
      const plan = await callOpenAI(args);
      return plan;
    } catch (e: unknown) {
      attempt += 1;
      if (attempt > opts.retries) throw e as Error;
      await delay(delayMs);
      delayMs = Math.min(delayMs * 2, opts.maxDelayMs);
      log.warn('OpenAI retrying', { requestId: args.requestId, attempt, nextDelayMs: delayMs, error: (e as Error)?.message });
    }
  }
};


