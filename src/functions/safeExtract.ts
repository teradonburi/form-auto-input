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

export const safeExtractFillPlan = (data: unknown): FillPlan => {
  if (!isObject(data)) throw new Error('Unexpected OpenAI response');
  const choices = (data as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) throw new Error('No choices');
  const first = choices[0] as any;
  const msg = first?.message;
  const parsed = msg?.parsed ?? msg?.content;
  if (!parsed) throw new Error('No parsed/content in message');
  const obj = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  if (!isFillPlan(obj)) throw new Error('Parsed object is not FillPlan');
  return obj;
};


