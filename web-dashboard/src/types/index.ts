export type WhatsAppConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export type MessageStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';

export type CallStatus = 'MISSED' | 'ANSWERED' | 'REJECTED' | 'RINGING';

export type WhatsAppFollowUpStatus = 'PENDING' | 'SENT' | 'SCHEDULED' | 'FAILED' | 'IGNORED';

export interface CallEvent {
  id: string;
  phoneNumber: string;
  customerName?: string;
  timestamp: number;
  status: CallStatus;
  whatsappStatus: WhatsAppFollowUpStatus;
  suggestedMessage: string;
  notes?: string;
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
  notes?: string;
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
  mode: 'MANUAL' | 'WHATSAPP_WEB' | 'CLOUD_API';
  errorMessage?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  language: string;
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
  whatsAppWebConnectedNumber?: string;
}
