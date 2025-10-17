import { DomainMapping, DomainMappingRule, FieldMeaning } from '../types/index';

const keyForDomain = (domain: string) => `domainMapping:${domain}` as const;

export const loadDomainMapping = async (domain: string): Promise<DomainMapping> => {
  const key = keyForDomain(domain);
  const got = await chrome.storage.local.get([key]);
  const val = got[key] as unknown;
  if (!val || typeof val !== 'object') {
    return { domain, rules: [] };
  }
  const dm = val as DomainMapping;
  return dm.domain === domain && Array.isArray(dm.rules) ? dm : { domain, rules: [] };
};

export const saveDomainMapping = async (mapping: DomainMapping): Promise<void> => {
  const key = keyForDomain(mapping.domain);
  await chrome.storage.local.set({ [key]: mapping });
};

export const upsertRule = (mapping: DomainMapping, selector: string, meaning: FieldMeaning, valueTemplate?: string): DomainMapping => {
  const now = Date.now();
  const idx = mapping.rules.findIndex((r) => r.selector === selector);
  const rule: DomainMappingRule = { selector, meaning, valueTemplate, lastUpdatedAt: now };
  if (idx >= 0) {
    const next = [...mapping.rules];
    next[idx] = rule;
    return { ...mapping, rules: next };
  }
  return { ...mapping, rules: [...mapping.rules, rule] };
};


