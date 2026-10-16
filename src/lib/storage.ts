import {
  CallEvent,
  Customer,
  FollowUpSuggestion,
  MessageRecord,
  MessageTemplate,
  DispatchRule,
  BusinessSettings,
  WebhookEventLog,
  UserAccount,
  WhatsAppConnectionStatus,
} from '../types';

const STORAGE_PREFIX = 'misscall_';

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {}
}

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Apex Health Clinic',
  ownerName: 'Dr. Rahul Sharma',
  defaultCountryCode: '+91',
  isAutoReplyEnabled: true,
  autoReplyDelayMinutes: 0,
  workingHoursEnabled: true,
  workingHoursStart: '09:00',
  workingHoursEnd: '19:00',
  whatsAppSendingMode: 'MANUAL',
  defaultSmsSim: 'SIM 1 (Jio)',
  whatsAppWebConnectedNumber: '+91 98765 43210',
};

const DEFAULT_USER: UserAccount = {
  id: 'usr_owner_01',
  name: 'Dr. Rahul Sharma',
  email: 'ssdd747346@gmail.com',
  subscriptionStatus: 'ACTIVE',
  planName: 'Pro Business Plan (Unlimited)',
  subscriptionId: 'sub_pro_monthly',
};

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'General Missed Call Follow-Up',
    content: 'Hello! Sorry we missed your call from {{business_name}}. How can we assist you today?',
    isDefault: true,
    language: 'English',
  },
  {
    id: 'tmpl-2',
    name: 'Hindi Support',
    content: 'नमस्ते! {{business_name}} में कॉल करने के लिए धन्यवाद। हम आपका कॉल नहीं उठा पाए। बताएं हम आपकी क्या मदद कर सकते हैं?',
    isDefault: false,
    language: 'Hindi',
  },
];

const DEFAULT_RULES: DispatchRule[] = [
  {
    id: 'rule-1',
    name: 'Immediate First-Time Caller Follow-Up',
    isEnabled: true,
    priority: 1,
    conditionType: 'ALL_MISSED',
    workingHoursOnly: false,
    cooldownMinutes: 30,
    templateId: 'tmpl-1',
  },
];

export const appStorage = {
  getCalls: (): CallEvent[] => getStored<CallEvent[]>('calls', []),
  saveCalls: (data: CallEvent[]) => setStored('calls', data),

  getCustomers: (): Customer[] => getStored<Customer[]>('customers', []),
  saveCustomers: (data: Customer[]) => setStored('customers', data),

  getSuggestions: (): FollowUpSuggestion[] => getStored<FollowUpSuggestion[]>('suggestions', []),
  saveSuggestions: (data: FollowUpSuggestion[]) => setStored('suggestions', data),

  getMessages: (): MessageRecord[] => getStored<MessageRecord[]>('messages', []),
  saveMessages: (data: MessageRecord[]) => setStored('messages', data),

  getTemplates: (): MessageTemplate[] => getStored<MessageTemplate[]>('templates', DEFAULT_TEMPLATES),
  saveTemplates: (data: MessageTemplate[]) => setStored('templates', data),

  getRules: (): DispatchRule[] => getStored<DispatchRule[]>('rules', DEFAULT_RULES),
  saveRules: (data: DispatchRule[]) => setStored('rules', data),

  getSettings: (): BusinessSettings => getStored<BusinessSettings>('settings', DEFAULT_SETTINGS),
  saveSettings: (data: BusinessSettings) => setStored('settings', data),

  getWebhooks: (): WebhookEventLog[] => getStored<WebhookEventLog[]>('webhooks', []),
  saveWebhooks: (data: WebhookEventLog[]) => setStored('webhooks', data),

  getSession: (): { status: WhatsAppConnectionStatus; linkedNumber?: string } =>
    getStored('session', { status: 'CONNECTED', linkedNumber: '+91 98765 43210' }),
  saveSession: (data: { status: WhatsAppConnectionStatus; linkedNumber?: string }) => setStored('session', data),

  getUser: (): UserAccount => getStored<UserAccount>('user', DEFAULT_USER),
  saveUser: (data: UserAccount) => setStored('user', data),

  resetAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};
