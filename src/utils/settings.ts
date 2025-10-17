export type OpenAISettings = {
  enabled: boolean;
  apiKey?: string;
  model?: string;
  temperature?: number;
};

export type PrivacySettings = {
  // keys indicating which profile fields are allowed to be sent to AI
  allowedProfileFields?: string[];
};

export type AppSettings = {
  locale: string;
  openai: OpenAISettings;
  privacy: PrivacySettings;
};

const DEFAULT_SETTINGS: AppSettings = {
  locale: 'ja-JP',
  openai: { enabled: false },
  privacy: {},
};

export const loadSettings = async (): Promise<AppSettings> => {
  const keys = ['settings'];
  const raw = await chrome.storage.local.get(keys);
  const s = raw.settings as unknown;
  if (!s || typeof s !== 'object') return DEFAULT_SETTINGS;
  const obj = s as Partial<AppSettings>;
  return {
    locale: typeof obj.locale === 'string' ? obj.locale : DEFAULT_SETTINGS.locale,
    openai: {
      enabled: !!obj.openai?.enabled,
      apiKey: typeof obj.openai?.apiKey === 'string' ? obj.openai.apiKey : undefined,
      model: typeof obj.openai?.model === 'string' ? obj.openai.model : undefined,
      temperature: typeof obj.openai?.temperature === 'number' ? obj.openai.temperature : undefined,
    },
    privacy: {
      allowedProfileFields: Array.isArray(obj.privacy?.allowedProfileFields)
        ? obj.privacy?.allowedProfileFields.filter((x): x is string => typeof x === 'string')
        : undefined,
    },
  };
};


