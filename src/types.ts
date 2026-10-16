export type WhatsAppConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export type MessageStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export type CallStatus = 'MISSED' | 'ANSWERED' | 'REJECTED' | 'RINGING';

export type WhatsAppFollowUpStatus = 'PENDING' | 'SENT' | 'SCHEDULED' | 'FAILED' | 'IGNORED' | 'SKIPPED';

export type ChannelType = 'WHATSAPP' | 'SMS' | 'EMAIL';

export interface ActivityItem {
  id: string;
  customerId: string;
  type: string;
  description: string;
  timestamp: number;
  channel?: ChannelType;
}

export interface Customer {
  id: string;
  phoneNumber: string;
  name: string;
  company?: string;
  totalMissedCalls: number;
  lastCallTimestamp: number;
  isVip: boolean;
  isBlacklisted: boolean;
  status?: string;
  notes?: string;
  activityHistory?: ActivityItem[];
}

export interface CallEvent {
  id: string;
  phoneNumber: string;
  customerName?: string;
  timestamp: number;
  status: CallStatus;
  whatsappStatus: WhatsAppFollowUpStatus;
  suggestedMessage: string;
  simSlot?: string;
  notes?: string;
  rawDurationSeconds?: number;
  idempotencyKey?: string;
}

export interface MessageRecord {
  id: string;
  callEventId?: string;
  customerId?: string;
  phoneNumber: string;
  customerName?: string;
  content: string;
  timestamp: number;
  status: MessageStatus;
  mode?: string;
  channel?: ChannelType;
  simSlot?: string;
  errorMessage?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  language: string;
  category?: string;
}

export interface DispatchRule {
  id: string;
  name: string;
  isEnabled: boolean;
  priority: number;
  conditionType: 'ALL_MISSED' | 'FIRST_TIME' | 'VIP_ONLY' | 'AFTER_HOURS';
  workingHoursOnly: boolean;
  cooldownMinutes: number;
  templateId?: string;
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  defaultCountryCode: string;
  isAutoReplyEnabled: boolean;
  autoReplyDelayMinutes: number;
  workingHoursEnabled: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  whatsAppSendingMode: 'MANUAL' | 'WHATSAPP_WEB' | 'CLOUD_API';
  defaultSmsSim: string;
  whatsAppWebConnectedNumber?: string;
  metaAccessToken?: string;
  metaPhoneNumberId?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  isWebhookEnabled?: boolean;
}

export interface WebhookEventLog {
  id: string;
  eventType: string;
  timestamp: number;
  statusCode: number;
  signature: string;
  responseTimeMs: number;
  idempotencyKey: string;
  payload: any;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE';
  planName: string;
  subscriptionId?: string;
  razorpayPaymentId?: string;
}

export interface FollowUpSuggestion {
  id: string;
  callEventId: string;
  phoneNumber: string;
  customerName?: string;
  suggestedMessage: string;
  status: 'PENDING' | 'APPROVED' | 'DISMISSED';
  createdAt: number;
  channel?: ChannelType;
}
