import { FillItem, FillPlan, FormSchema } from '../types/index';

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));
const todayDate = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const nowDateTimeLocal = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const buildPlaceholderValue = (type: string): string | boolean | undefined => {
  switch (type) {
    case 'email':
      return 'example@example.com';
    case 'tel':
      return '09012345678';
    case 'number':
      return '1';
    case 'url':
      return 'https://example.com';
    case 'date':
      return todayDate();
    case 'datetime-local':
      return nowDateTimeLocal();
    case 'select':
      return ''; // let content script choose the first viable option
    case 'textarea':
    case 'text':
      return 'DEMO';
    default:
      return undefined;
  }
};

export const buildPlaceholderPlan = (schema: FormSchema): FillPlan => {
  const items: FillItem[] = [];
  for (const f of schema.fields) {
    if (f.type === 'password' || f.type === 'hidden' || f.type === 'radio' || f.type === 'checkbox') {
      continue; // skip sensitive/ambiguous by default
    }
    const value = buildPlaceholderValue(f.type);
    if (value === undefined) continue;
    items.push({
      fieldId: f.selector, // prefer CSS selector for reliable querying
      meaning: 'unknown',
      value,
      confidence: 0.5,
      requiresConfirmation: false,
      sensitive: false,
    });
  }
  return { formId: schema.formId, items };
};


