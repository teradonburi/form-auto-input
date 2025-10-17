import { FillItem, FillPlan, FormSchema } from '../types/index';

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
    if (f.type === 'password' || f.type === 'hidden' || f.type === 'radio' || f.type === 'checkbox' || f.type === 'select') {
      continue; // skip sensitive/ambiguous by default
    }
    const value = buildPlaceholderValue(f.type);
    if (value === undefined) continue;
    items.push({
      fieldId: f.id,
      meaning: 'unknown',
      value,
      confidence: 0.5,
      requiresConfirmation: false,
      sensitive: false,
    });
  }
  return { formId: schema.formId, items };
};


