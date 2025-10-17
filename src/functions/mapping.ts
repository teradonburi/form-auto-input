import { DomainMapping, DomainMappingRule, FieldMeaning } from '../types/index';
import { log } from '../utils/logger';

const keyForDomain = (domain: string) => `domainMapping:${domain}` as const;

export const loadDomainMapping = async (domain: string): Promise<DomainMapping> => {
  const key = keyForDomain(domain);
  const got = await chrome.storage.local.get([key]);
  const val = got[key] as unknown;
  if (!val || typeof val !== 'object') {
    log.debug('No mapping yet for domain', domain);
    return { domain, rules: [] };
  }
  const dm = val as DomainMapping;
  log.debug('Loaded mapping', domain, dm.rules.length);
  return dm.domain === domain && Array.isArray(dm.rules) ? dm : { domain, rules: [] };
};

export const saveDomainMapping = async (mapping: DomainMapping): Promise<void> => {
  const key = keyForDomain(mapping.domain);
  await chrome.storage.local.set({ [key]: mapping });
  log.info('Saved mapping', mapping.domain, mapping.rules.length);
};

export const upsertRule = (mapping: DomainMapping, selector: string, meaning: FieldMeaning, valueTemplate?: string): DomainMapping => {
  const now = Date.now();
  const idx = mapping.rules.findIndex((r) => r.selector === selector);
  const rule: DomainMappingRule = { selector, meaning, valueTemplate, lastUpdatedAt: now };
  if (idx >= 0) {
    const next = [...mapping.rules];
    next[idx] = rule;
    log.debug('Updated mapping rule', selector, meaning);
    return { ...mapping, rules: next };
  }
  log.debug('Inserted mapping rule', selector, meaning);
  return { ...mapping, rules: [...mapping.rules, rule] };
};


