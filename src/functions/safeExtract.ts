import { FillItem, FillPlan } from '../types/index';

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const isFillItem = (v: unknown): v is FillItem => {
  if (!isObject(v)) return false;
  return (
    typeof v.fieldId === 'string' &&
    typeof v.meaning === 'string' &&
    (typeof v.value === 'string' || typeof v.value === 'boolean') &&
    typeof v.confidence === 'number' &&
    v.confidence >= 0 && v.confidence <= 1 &&
    typeof v.requiresConfirmation === 'boolean' &&
    typeof v.sensitive === 'boolean'
  );
};

const isFillPlan = (v: unknown): v is FillPlan => {
  if (!isObject(v)) return false;
  if (typeof v.formId !== 'string') return false;
  if (!Array.isArray(v.items)) return false;
  if (!v.items.every(isFillItem)) return false;
  if (v.notes !== undefined && (!Array.isArray(v.notes) || !v.notes.every((n) => typeof n === 'string'))) return false;
  return true;
};

type OpenAIChat = {
  choices: Array<{
    message?: { content?: string };
  }>;
};

const isOpenAIChat = (v: unknown): v is OpenAIChat => {
  if (!isObject(v)) return false;
  const choices = (v as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return false;
  const first = choices[0] as unknown;
  if (!isObject(first)) return false;
  const msg = (first as { message?: unknown }).message;
  if (!isObject(msg)) return false;
  const content = (msg as { content?: unknown }).content;
  return typeof content === 'string' && content.length > 0;
};

const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const slice = raw.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error('OpenAI content is not valid JSON');
  }
};

export const safeExtractFillPlan = (data: unknown): FillPlan => {
  if (!isOpenAIChat(data)) {
    throw new Error('Unexpected OpenAI response shape');
  }
  const content = data.choices[0]?.message?.content ?? '';
  const parsed = tryParseJson(content);
  if (!isFillPlan(parsed)) {
    throw new Error('Parsed JSON is not a valid FillPlan');
  }
  return parsed;
};


