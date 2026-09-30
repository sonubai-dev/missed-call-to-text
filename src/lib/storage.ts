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
} from "../types";

const STORAGE_KEYS = {
  CALLS: "misscall_calls_v1",
  CUSTOMERS: "misscall_customers_v1",
  SUGGESTIONS: "misscall_suggestions_v1",
  MESSAGES: "misscall_messages_v1",
  TEMPLATES: "misscall_templates_v1",
  RULES: "misscall_rules_v1",
  SETTINGS: "misscall_settings_v1",
  WEBHOOKS: "misscall_webhooks_v1",
  SESSION: "misscall_session_v1",
  USER: "misscall_user_v1",
};

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: "Apex Electronics & Smart Devices",
  ownerName: "Sonu Bai",
  defaultCountryCode: "+91",
  isAutoReplyEnabled: true,
  autoReplyDelayMinutes: 0,
  workingHoursEnabled: true,
  workingHoursStart: "09:00",
  workingHoursEnd: "19:00",
  whatsAppSendingMode: "WHATSAPP_WEB",
  defaultSmsSim: "SIM 1 (Airtel)",
  webhookUrl: "https://api.example.com/webhooks/missed-call",
  webhookSecret: "whsec_993fa9128bca4817a0cd41e97d1f92e8",
  isWebhookEnabled: true,
};

export const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: "tmpl-1",
    name: "Standard Missed Call (Default)",
    content: "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you today? Please reply here and our team will get right back to you!",
    language: "en",
    isDefault: true,
    category: "MISSED_CALL",
  },
  {
    id: "tmpl-2",
    name: "VIP Priority Follow-up",
    content: "Hello {{name}}, this is {{owner_name}} from {{business_name}}. We apologize for missing your call. As a priority client, your request is at the top of our queue. What can we do for you?",
    language: "en",
    isDefault: false,
    category: "VIP_OFFER",
  },
  {
    id: "tmpl-3",
    name: "After Hours Notice",
    content: "Hi {{name}}, thanks for calling {{business_name}}. We are currently closed for the evening. Our team will return your call first thing tomorrow morning, or reply here anytime!",
    language: "en",
    isDefault: false,
    category: "AFTER_HOURS",
  },
  {
    id: "tmpl-4",
    name: "Quick SMS Callback Alert",
    content: "Sorry we missed your call to {{business_name}}! Reply to this SMS with your inquiry or visit apex-store.com for immediate support.",
    language: "en",
    isDefault: false,
    category: "CUSTOM",
  },
];

export const INITIAL_RULES: DispatchRule[] = [
  {
    id: "rule-1",
    name: "VIP Instant WhatsApp Route",
    isEnabled: true,
    priority: 1,
    conditionType: "VIP_ONLY",
    channelType: "WHATSAPP",
    templateId: "tmpl-2",
    delaySeconds: 0,
    cooldownMinutes: 120,
    workingHoursOnly: false,
  },
  {
    id: "rule-2",
    name: "After-Hours Auto-SMS",
    isEnabled: true,
    priority: 2,
    conditionType: "AFTER_HOURS",
    channelType: "SMS",
    templateId: "tmpl-3",
    delaySeconds: 15,
    cooldownMinutes: 1440,
    workingHoursOnly: false,
  },
  {
    id: "rule-3",
    name: "First-Time Callers Quick Assist",
    isEnabled: true,
    priority: 3,
    conditionType: "FIRST_TIME",
    channelType: "WHATSAPP",
    templateId: "tmpl-1",
    delaySeconds: 0,
    cooldownMinutes: 720,
    workingHoursOnly: true,
  },
  {
    id: "rule-4",
    name: "Standard All Missed Calls",
    isEnabled: true,
    priority: 4,
    conditionType: "ALL_MISSED",
    channelType: "WHATSAPP",
    templateId: "tmpl-1",
    delaySeconds: 0,
    cooldownMinutes: 360,
    workingHoursOnly: true,
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Dr. Rajesh Sharma",
    phoneNumber: "+91 98765 12345",
    company: "Sharma Care Clinic",
    email: "rajesh@sharmacare.org",
    notes: "VIP Client. Looking to order 5 smart biometric displays for medical center.",
    isVip: true,
    isBlacklisted: false,
    totalMissedCalls: 3,
    lastCallTimestamp: Date.now() - 1000 * 60 * 18,
    status: "CONVERTED",
    activityHistory: [
      {
        id: "act-1",
        customerId: "cust-1",
        type: "MISSED_CALL",
        description: "Missed incoming call on SIM 1 (Airtel)",
        timestamp: Date.now() - 1000 * 60 * 18,
      },
      {
        id: "act-2",
        customerId: "cust-1",
        type: "WHATSAPP_SENT",
        description: 'Auto-dispatched VIP Priority Follow-up via WhatsApp Web',
        timestamp: Date.now() - 1000 * 60 * 17,
        channel: "WHATSAPP",
      },
      {
        id: "act-3",
        customerId: "cust-1",
        type: "STATUS_CHANGE",
        description: "Marked as CONVERTED by Sonu Bai",
        timestamp: Date.now() - 1000 * 60 * 5,
      },
    ],
  },
  {
    id: "cust-2",
    name: "Pooja Verma",
    phoneNumber: "+91 98765 67890",
    company: "Verma Real Estate",
    email: "pooja@vermarealty.in",
    notes: "Interested in wholesale IoT sensors for new apartment project.",
    isVip: false,
    isBlacklisted: false,
    totalMissedCalls: 1,
    lastCallTimestamp: Date.now() - 1000 * 60 * 42,
    status: "CONTACTED",
    activityHistory: [
      {
        id: "act-4",
        customerId: "cust-2",
        type: "MISSED_CALL",
        description: "Missed call on SIM 1 (Airtel)",
        timestamp: Date.now() - 1000 * 60 * 42,
      },
      {
        id: "act-5",
        customerId: "cust-2",
        type: "WHATSAPP_SENT",
        description: "Sent Standard Missed Call follow-up via WhatsApp",
        timestamp: Date.now() - 1000 * 60 * 41,
        channel: "WHATSAPP",
      },
    ],
  },
  {
    id: "cust-3",
    name: "Amit Deshmukh",
    phoneNumber: "+91 98111 22334",
    company: "Tech Mahindra Systems",
    email: "amit.d@techm.com",
    notes: "First time caller, looking for product catalogue.",
    isVip: false,
    isBlacklisted: false,
    totalMissedCalls: 1,
    lastCallTimestamp: Date.now() - 1000 * 60 * 95,
    status: "NEW",
    activityHistory: [
      {
        id: "act-6",
        customerId: "cust-3",
        type: "MISSED_CALL",
        description: "Missed incoming call",
        timestamp: Date.now() - 1000 * 60 * 95,
      },
    ],
  },
  {
    id: "cust-4",
    name: "Spam Robocaller / Telemarketing",
    phoneNumber: "+91 90000 00000",
    company: "Unknown",
    notes: "Unsolicited credit card loan sales robot. Automatically ignored.",
    isVip: false,
    isBlacklisted: true,
    totalMissedCalls: 5,
    lastCallTimestamp: Date.now() - 1000 * 60 * 180,
    status: "INACTIVE",
    activityHistory: [
      {
        id: "act-7",
        customerId: "cust-4",
        type: "MISSED_CALL",
        description: "Missed call blocked by Spam Blacklist rule",
        timestamp: Date.now() - 1000 * 60 * 180,
      },
    ],
  },
  {
    id: "cust-5",
    name: "Sarah Jenkins",
    phoneNumber: "+1 (415) 555-0199",
    company: "Global Logistics Inc",
    email: "sjenkins@globallogistics.us",
    notes: "International client (US). Normalization to E.164 verified.",
    isVip: true,
    isBlacklisted: false,
    totalMissedCalls: 2,
    lastCallTimestamp: Date.now() - 1000 * 60 * 320,
    status: "CONTACTED",
    activityHistory: [
      {
        id: "act-8",
        customerId: "cust-5",
        type: "MISSED_CALL",
        description: "Missed international call (+1 415)",
        timestamp: Date.now() - 1000 * 60 * 320,
      },
    ],
  },
];

export const INITIAL_CALLS: CallEvent[] = [
  {
    id: "call-1",
    phoneNumber: "+91 98765 12345",
    customerName: "Dr. Rajesh Sharma",
    timestamp: Date.now() - 1000 * 60 * 18,
    status: "MISSED",
    whatsappStatus: "SENT",
    suggestedMessage: "Hello Dr. Rajesh Sharma, this is Sonu Bai from Apex Electronics & Smart Devices. We apologize for missing your call. As a priority client, your request is at the top of our queue. What can we do for you?",
    simSlot: "SIM 1 (Airtel)",
    channelUsed: "WHATSAPP",
    rawDurationSeconds: 16,
    idempotencyKey: "CALL_e87f1a90c1",
  },
  {
    id: "call-2",
    phoneNumber: "+91 98765 67890",
    customerName: "Pooja Verma",
    timestamp: Date.now() - 1000 * 60 * 42,
    status: "MISSED",
    whatsappStatus: "SENT",
    suggestedMessage: "Hi Pooja Verma, we noticed that you called Apex Electronics & Smart Devices. Sorry we missed your call. How can we help you today? Please reply here and our team will get right back to you!",
    simSlot: "SIM 1 (Airtel)",
    channelUsed: "WHATSAPP",
    rawDurationSeconds: 22,
    idempotencyKey: "CALL_b4129e44ff",
  },
  {
    id: "call-3",
    phoneNumber: "+91 98111 22334",
    customerName: "Amit Deshmukh",
    timestamp: Date.now() - 1000 * 60 * 95,
    status: "MISSED",
    whatsappStatus: "PENDING",
    suggestedMessage: "Hi Amit Deshmukh, we noticed that you called Apex Electronics & Smart Devices. Sorry we missed your call. How can we help you today? Please reply here and our team will get right back to you!",
    simSlot: "SIM 2 (Jio)",
    channelUsed: "WHATSAPP",
    rawDurationSeconds: 12,
    idempotencyKey: "CALL_77d8a0c231",
  },
  {
    id: "call-4",
    phoneNumber: "+91 90000 00000",
    customerName: "Spam Robocaller / Telemarketing",
    timestamp: Date.now() - 1000 * 60 * 180,
    status: "MISSED",
    whatsappStatus: "IGNORED",
    suggestedMessage: "Blacklisted spam caller. Follow-up blocked by CallScreeningService.",
    simSlot: "SIM 1 (Airtel)",
    channelUsed: "SMS",
    rawDurationSeconds: 5,
    idempotencyKey: "CALL_1189ac39de",
  },
  {
    id: "call-5",
    phoneNumber: "+1 (415) 555-0199",
    customerName: "Sarah Jenkins",
    timestamp: Date.now() - 1000 * 60 * 320,
    status: "MISSED",
    whatsappStatus: "SENT",
    suggestedMessage: "Hi Sarah Jenkins, thank you for contacting Apex Electronics & Smart Devices. We apologize for missing your call. Please let us know how we can assist your international shipment.",
    simSlot: "SIM 1 (Airtel)",
    channelUsed: "WHATSAPP",
    rawDurationSeconds: 25,
    idempotencyKey: "CALL_664ac98f21",
  },
];

export const INITIAL_MESSAGES: MessageRecord[] = [
  {
    id: "msg-1",
    callEventId: "call-1",
    phoneNumber: "+91 98765 12345",
    customerName: "Dr. Rajesh Sharma",
    content: "Hello Dr. Rajesh Sharma, this is Sonu Bai from Apex Electronics & Smart Devices. We apologize for missing your call. As a priority client, your request is at the top of our queue. What can we do for you?",
    timestamp: Date.now() - 1000 * 60 * 17,
    status: "DELIVERED",
    mode: "WHATSAPP_WEB",
    channel: "WHATSAPP",
  },
  {
    id: "msg-2",
    callEventId: "call-2",
    phoneNumber: "+91 98765 67890",
    customerName: "Pooja Verma",
    content: "Hi Pooja Verma, we noticed that you called Apex Electronics & Smart Devices. Sorry we missed your call. How can we help you today? Please reply here and our team will get right back to you!",
    timestamp: Date.now() - 1000 * 60 * 41,
    status: "DELIVERED",
    mode: "WHATSAPP_WEB",
    channel: "WHATSAPP",
  },
  {
    id: "msg-3",
    phoneNumber: "+91 98765 12345",
    customerName: "Dr. Rajesh Sharma",
    content: "Thank you for the quick follow up! Can you send me the quote for the 5 units of Smart displays?",
    timestamp: Date.now() - 1000 * 60 * 10,
    status: "DELIVERED",
    mode: "WHATSAPP_WEB",
    channel: "WHATSAPP",
  },
  {
    id: "msg-4",
    phoneNumber: "+91 99887 76655",
    customerName: "Vikram Malhotra",
    content: "Sorry we missed your call to Apex Electronics & Smart Devices! Reply to this SMS with your inquiry or visit apex-store.com for immediate support.",
    timestamp: Date.now() - 1000 * 60 * 500,
    status: "SENT",
    mode: "SMS_SIM1",
    channel: "SMS",
    simSlot: "SIM 1 (Airtel)",
  },
];

export const INITIAL_SUGGESTIONS: FollowUpSuggestion[] = [
  {
    id: "sug-1",
    callEventId: "call-3",
    phoneNumber: "+91 98111 22334",
    customerName: "Amit Deshmukh",
    suggestedMessage: "Hi Amit Deshmukh, we noticed that you called Apex Electronics & Smart Devices. Sorry we missed your call. How can we help you today? Please reply here and our team will get right back to you!",
    status: "PENDING",
    createdAt: Date.now() - 1000 * 60 * 95,
    channel: "WHATSAPP",
  },
];

export const INITIAL_WEBHOOKS: WebhookEventLog[] = [
  {
    id: "wh-1",
    eventType: "missed_call",
    timestamp: Date.now() - 1000 * 60 * 18,
    statusCode: 200,
    signature: "sha256=d7a8fbc89e349281a1c93f",
    responseTimeMs: 142,
    idempotencyKey: "CALL_e87f1a90c1",
    payload: {
      event_type: "missed_call",
      event_version: "1.0",
      caller: {
        phone: "+919876512345",
        name: "Dr. Rajesh Sharma",
        is_vip: true,
      },
      call: {
        idempotency_key: "CALL_e87f1a90c1",
        sim_slot: "SIM 1 (Airtel)",
        duration_ring_sec: 16,
      },
    },
  },
  {
    id: "wh-2",
    eventType: "whatsapp_sent",
    timestamp: Date.now() - 1000 * 60 * 17,
    statusCode: 200,
    signature: "sha256=10f2c4a9198ab761e0e891",
    responseTimeMs: 89,
    idempotencyKey: "MSG_9941a87e0",
    payload: {
      event_type: "whatsapp_sent",
      recipient: "+919876512345",
      channel: "WHATSAPP",
      delivery_mode: "WHATSAPP_WEB",
    },
  },
];

export const INITIAL_USER: UserAccount = {
  email: "owner@apexelectronics.com",
  name: "Sonu Bai",
  subscriptionStatus: "ACTIVE",
  planName: "Pro Business Plan (Unlimited Missed Calls)",
  subscriptionId: "sub_N7b88fa9012cd",
};

// Storage helper functions
export const appStorage = {
  getCalls(): CallEvent[] {
    const data = localStorage.getItem(STORAGE_KEYS.CALLS);
    return data ? JSON.parse(data) : INITIAL_CALLS;
  },
  saveCalls(calls: CallEvent[]) {
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
  },

  getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
  },
  saveCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getSuggestions(): FollowUpSuggestion[] {
    const data = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
    return data ? JSON.parse(data) : INITIAL_SUGGESTIONS;
  },
  saveSuggestions(sug: FollowUpSuggestion[]) {
    localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(sug));
  },

  getMessages(): MessageRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : INITIAL_MESSAGES;
  },
  saveMessages(msgs: MessageRecord[]) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
  },

  getTemplates(): MessageTemplate[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : INITIAL_TEMPLATES;
  },
  saveTemplates(tmpls: MessageTemplate[]) {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(tmpls));
  },

  getRules(): DispatchRule[] {
    const data = localStorage.getItem(STORAGE_KEYS.RULES);
    return data ? JSON.parse(data) : INITIAL_RULES;
  },
  saveRules(rules: DispatchRule[]) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  },

  getSettings(): BusinessSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : INITIAL_SETTINGS;
  },
  saveSettings(settings: BusinessSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getWebhooks(): WebhookEventLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.WEBHOOKS);
    return data ? JSON.parse(data) : INITIAL_WEBHOOKS;
  },
  saveWebhooks(logs: WebhookEventLog[]) {
    localStorage.setItem(STORAGE_KEYS.WEBHOOKS, JSON.stringify(logs));
  },

  getUser(): UserAccount {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : INITIAL_USER;
  },
  saveUser(user: UserAccount) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getSession(): { status: WhatsAppConnectionStatus; linkedNumber?: string } {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : { status: "CONNECTED", linkedNumber: "+91 98765 43210" };
  },
  saveSession(session: { status: WhatsAppConnectionStatus; linkedNumber?: string }) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  resetAll() {
    localStorage.clear();
  },
};
