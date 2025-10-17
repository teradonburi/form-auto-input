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
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const callOpenAI = async (args: CallOpenAIArgs): Promise<FillPlan> => {
  const body = {
    model: args.model,
    response_format: {
      type: 'json_schema',
      json_schema: {
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
      },
    },
    messages: [
      {
        role: 'system',
        content: [
          'あなたはフォーム入力の自動化エージェントです。',
          '出力は厳密にJSONスキーマに従ってください。説明文は出力しないでください。',
          '機密項目（password, card_*）はsensitive: trueとし、必ずrequiresConfirmation: trueとします。',
          '既知のドメインマッピングがあれば優先し、なければ推論します。',
          'ラベル/周辺文脈からフィールドの意味付けを行い、確信度を0-1で示してください。',
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify({
          locale: args.locale,
          schema: args.schema,
          hints: args.domainMapping ?? null,
          profile: args.profile ?? null,
        }),
      },
    ],
    temperature: args.temperature ?? 0,
  } as const;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    log.warn('OpenAI non-OK status', res.status, await res.text().catch(() => ''));
    throw new Error(`OpenAI API error: ${res.status}`);
  }
  const data: unknown = await res.json();
  log.debug('OpenAI raw response received');
  return safeExtractFillPlan(data);
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
      log.debug('OpenAI attempt', attempt + 1);
      const plan = await callOpenAI(args);
      return plan;
    } catch (e: unknown) {
      attempt += 1;
      if (attempt > opts.retries) throw e as Error;
      await delay(delayMs);
      delayMs = Math.min(delayMs * 2, opts.maxDelayMs);
      log.warn('OpenAI retrying', attempt, 'nextDelayMs', delayMs, e);
    }
  }
};


