// Background service worker (MV3) for form-auto-input
import { CsToBgMessage, BgToCsMessage, FormSchema, FillPlan, MsgLearnMapping } from './types/index';
import { loadSettings } from './utils/settings';
import { buildPlaceholderPlan } from './functions/placeholder';
import { callOpenAIWithRetry } from './functions/openai';
import { loadDomainMapping, saveDomainMapping, upsertRule } from './functions/mapping';

chrome.runtime.onMessage.addListener((msg: unknown, _sender, sendResponse) => {
  const m = msg as CsToBgMessage;
  (async () => {
    if (m && m.kind === 'request_fill') {
      try {
        const plan = await makePlan(m.payload.schema);
        const resp: BgToCsMessage = { kind: 'fill_result', payload: { plan } };
        sendResponse(resp);
      } catch (e: unknown) {
        const resp: BgToCsMessage = { kind: 'error', payload: { message: (e as Error).message } };
        sendResponse(resp);
      }
    } else if (m && m.kind === 'learn_mapping') {
      const mm = m as MsgLearnMapping;
      try {
        const mapping = await loadDomainMapping(mm.payload.domain);
        const next = mm.payload.corrections.reduce((acc, it) => upsertRule(acc, it.fieldId, it.meaning, typeof it.value === 'string' ? it.value : undefined), mapping);
        await saveDomainMapping(next);
        sendResponse({ kind: 'fill_result', payload: { plan: { formId: 'noop', items: [] } } } satisfies BgToCsMessage);
      } catch (e: unknown) {
        const resp: BgToCsMessage = { kind: 'error', payload: { message: (e as Error).message } };
        sendResponse(resp);
      }
    }
  })();
  return true; // keep channel open for async
});

const makePlan = async (schema: FormSchema): Promise<FillPlan> => {
  const settings = await loadSettings();
  if (!settings.openai.enabled) {
    return buildPlaceholderPlan(schema);
  }

  const apiKey = settings.openai.apiKey;
  const model = settings.openai.model;
  if (!apiKey || !model) {
    return buildPlaceholderPlan(schema);
  }

  try {
    return await callOpenAIWithRetry(
      {
        schema,
        locale: settings.locale,
        model,
        apiKey,
        temperature: settings.openai.temperature,
      },
      { retries: 4, initialDelayMs: 500, maxDelayMs: 16000 }
    );
  } catch (e) {
    // Fallback to placeholder plan on failure
    return buildPlaceholderPlan(schema);
  }
};


