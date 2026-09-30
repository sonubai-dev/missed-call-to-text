export type WhatsAppFollowUpStatus = "PENDING" | "SENT" | "IGNORED" | "SKIPPED";
export type CallStatus = "MISSED" | "INCOMING" | "ANSWERED" | "REJECTED";
export type ChannelType = "WHATSAPP" | "SMS" | "EMAIL";
export type MessageStatus = "QUEUED" | "SENDING" | "SENT" | "DELIVERED" | "FAILED";
export type WhatsAppConnectionStatus = "CONNECTED" | "CONNECTING" | "DISCONNECTED";

export interface CallEvent {
  id: string;
  phoneNumber: string;
  customerName?: string;
  timestamp: number;
  status: CallStatus;
  whatsappStatus: WhatsAppFollowUpStatus;
  suggestedMessage: string;
  simSlot?: "SIM 1 (Airtel)" | "SIM 2 (Jio)";
  channelUsed?: ChannelType;
  rawDurationSeconds?: number;
  idempotencyKey: string;
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: "MISSED_CALL" | "WHATSAPP_SENT" | "SMS_SENT" | "STATUS_CHANGE" | "NOTE_ADDED";
  description: string;
  timestamp: number;
  channel?: ChannelType;
  meta?: Record<string, any>;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  company?: string;
  email?: string;
  notes?: string;
  isVip: boolean;
  isBlacklisted: boolean;
  totalMissedCalls: number;
  lastCallTimestamp: number;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "INACTIVE";
  activityHistory?: CustomerActivity[];
}

export interface FollowUpSuggestion {
  id: string;
  callEventId: string;
  phoneNumber: string;
  customerName?: string;
  suggestedMessage: string;
  status: "PENDING" | "SCHEDULED" | "APPROVED" | "DISMISSED";
  createdAt: number;
  scheduledFor?: number;
  channel: ChannelType;
}

export interface MessageRecord {
  id: string;
  callEventId?: string;
  phoneNumber: string;
  customerName?: string;
  content: string;
  timestamp: number;
  status: MessageStatus;
  mode: "MANUAL" | "WHATSAPP_WEB" | "CLOUD_API" | "SMS_SIM1" | "SMS_SIM2" | "EMAIL";
  errorMessage?: string;
  simSlot?: string;
  channel: ChannelType;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  language: string;
  isDefault: boolean;
  category: "MISSED_CALL" | "VIP_OFFER" | "AFTER_HOURS" | "CUSTOM";
}

export interface DispatchRule {
  id: string;
  name: string;
  isEnabled: boolean;
  priority: number;
  conditionType: "ALL_MISSED" | "FIRST_TIME" | "VIP_ONLY" | "AFTER_HOURS" | "BLACKLIST";
  channelType: ChannelType;
  templateId: string;
  delaySeconds: number;
  cooldownMinutes: number;
  workingHoursOnly: boolean;
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
  whatsAppSendingMode: "MANUAL" | "WHATSAPP_WEB" | "CLOUD_API";
  defaultSmsSim: "SIM 1 (Airtel)" | "SIM 2 (Jio)";
  metaAccessToken?: string;
  metaPhoneNumberId?: string;
  webhookUrl: string;
  webhookSecret: string;
  isWebhookEnabled: boolean;
}

export interface WebhookEventLog {
  id: string;
  eventType: string;
  timestamp: number;
  statusCode: number;
  signature: string;
  payload: any;
  responseTimeMs: number;
  idempotencyKey: string;
}

export interface UserAccount {
  email: string;
  name: string;
  subscriptionStatus: "ACTIVE" | "INACTIVE" | "TRIAL";
  planName: string;
  subscriptionId?: string;
  razorpayPaymentId?: string;
}
