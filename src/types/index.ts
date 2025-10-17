// Shared types for form-auto-input (strict, no any)

export type FieldType =
  | 'text' | 'email' | 'tel' | 'password' | 'number'
  | 'date' | 'datetime-local' | 'url'
  | 'textarea' | 'select' | 'radio' | 'checkbox' | 'hidden';

export type FieldConfidence = 0 | 1 | 2;

export type FieldDescriptor = {
  id: string;
  name?: string;
  labelText?: string;
  placeholder?: string;
  ariaLabel?: string;
  role?: string;
  type: FieldType;
  required: boolean;
  maxlength?: number;
  pattern?: string;
  selector: string;
  contextTexts: string[];
};

export type FormSchema = {
  formId: string;
  action?: string;
  method?: 'get' | 'post' | 'dialog';
  fields: FieldDescriptor[];
};

export type UserProfile = {
  person?: {
    fullName?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
    tel?: string;
  };
  company?: {
    name?: string;
    department?: string;
    title?: string;
    tel?: string;
  };
  address?: {
    country?: string;
    postalCode?: string;
    region?: string;
    locality?: string;
    street?: string;
    building?: string;
  };
};

export type FieldMeaning =
  | 'full_name' | 'family_name' | 'given_name'
  | 'email' | 'tel' | 'company' | 'department' | 'title'
  | 'postal_code' | 'address_region' | 'address_locality' | 'address_street' | 'address_building'
  | 'url' | 'note'
  | 'username' | 'password' | 'password_confirm'
  | 'card_number' | 'card_holder' | 'card_exp' | 'card_cvv'
  | 'unknown';

export type DomainMappingRule = {
  selector: string;
  meaning: FieldMeaning;
  valueTemplate?: string;
  lastUpdatedAt: number;
};

export type DomainMapping = {
  domain: string;
  rules: DomainMappingRule[];
};

export type FillItem = {
  fieldId: string;
  meaning: FieldMeaning;
  value: string | boolean;
  confidence: number; // 0-1
  requiresConfirmation: boolean;
  sensitive: boolean;
};

export type FillPlan = {
  formId: string;
  items: FillItem[];
  notes?: string[];
};

export type MsgExtractForm = {
  kind: 'extract_form';
  payload: { schema: FormSchema; url: string };
};

export type MsgRequestFill = {
  kind: 'request_fill';
  payload: { schema: FormSchema; domainMapping?: DomainMapping; profile?: UserProfile; locale: string };
};

export type MsgApplyFill = {
  kind: 'apply_fill';
  payload: { plan: FillPlan };
};

export type MsgLearnMapping = {
  kind: 'learn_mapping';
  payload: { domain: string; corrections: FillItem[] };
};

export type BgToCsMessage =
  | { kind: 'fill_result'; payload: { plan: FillPlan } }
  | { kind: 'error'; payload: { message: string } };

export type CsToBgMessage = MsgRequestFill | MsgLearnMapping;


