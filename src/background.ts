// Background service worker (MV3) for form-auto-input
import { CsToBgMessage, BgToCsMessage, FormSchema, FillPlan, MsgLearnMapping } from './types/index';
import { loadSettings } from './utils/settings';
import { buildPlaceholderPlan } from './functions/placeholder';
import { callOpenAIWithRetry } from './functions/openai';
import { loadDomainMapping, saveDomainMapping, upsertRule } from './functions/mapping';
import { log } from './utils/logger';

chrome.runtime.onMessage.addListener((msg: unknown, _sender, sendResponse) => {
  log.debug('Received message', msg);
  const m = msg as CsToBgMessage;
  (async () => {
    if (m && m.kind === 'request_fill') {
      try {
        log.info('Handling request_fill', m.payload.schema.formId);
        const plan = await makePlan(m.payload.schema);
        const resp: BgToCsMessage = { kind: 'fill_result', payload: { plan } };
        log.info('Returning fill_result', plan.items.length);
        sendResponse(resp);
      } catch (e: unknown) {
        log.error('Error in request_fill', e);
        const resp: BgToCsMessage = { kind: 'error', payload: { message: (e as Error).message } };
        sendResponse(resp);
      }
    } else if (m && m.kind === 'learn_mapping') {
      const mm = m as MsgLearnMapping;
      try {
        log.info('Handling learn_mapping', mm.payload.domain, mm.payload.corrections.length);
        const mapping = await loadDomainMapping(mm.payload.domain);
        const next = mm.payload.corrections.reduce((acc, it) => upsertRule(acc, it.fieldId, it.meaning, typeof it.value === 'string' ? it.value : undefined), mapping);
        await saveDomainMapping(next);
        sendResponse({ kind: 'fill_result', payload: { plan: { formId: 'noop', items: [] } } } satisfies BgToCsMessage);
      } catch (e: unknown) {
        log.error('Error in learn_mapping', e);
        const resp: BgToCsMessage = { kind: 'error', payload: { message: (e as Error).message } };
        sendResponse(resp);
      }
    }
  })();
  return true; // keep channel open for async
});

const makePlan = async (schema: FormSchema): Promise<FillPlan> => {
  const settings = await loadSettings();
  log.debug('makePlan settings', settings.openai.enabled, settings.locale);
  if (!settings.openai.enabled) {
    log.info('OpenAI disabled, using placeholder');
    const pl = buildPlaceholderPlan(schema);
    return { ...pl, notes: [...(pl.notes ?? []), 'source=placeholder', 'reason=openaiDisabled'] };
  }

  const apiKey = settings.openai.apiKey;
  const model = settings.openai.model;
  if (!apiKey || !model) {
    log.warn('OpenAI missing apiKey or model, using placeholder');
    const pl = buildPlaceholderPlan(schema);
    return { ...pl, notes: [...(pl.notes ?? []), 'source=placeholder', 'reason=missingCredentials'] };
  }

  try {
    const plan = await callOpenAIWithRetry(
      {
        schema,
        locale: settings.locale,
        model,
        apiKey,
        temperature: settings.openai.temperature,
      },
      { retries: 4, initialDelayMs: 500, maxDelayMs: 16000 }
    );
    log.info('OpenAI plan received', plan.items.length);
    return { ...plan, notes: [...(plan.notes ?? []), `source=openai`, `model=${model}`] };
  } catch (e) {
    log.error('OpenAI failed, fallback to placeholder', e);
    // Fallback to placeholder plan on failure
    const pl = buildPlaceholderPlan(schema);
    return { ...pl, notes: [...(pl.notes ?? []), 'source=placeholder', 'reason=openaiError'] };
  }
};


