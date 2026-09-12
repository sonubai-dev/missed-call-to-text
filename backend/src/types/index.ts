export interface User {
  id: string;
  email: string;
  password_hash: string;
  subscription_status: 'INACTIVE' | 'ACTIVE' | 'CANCELLED';
  subscription_id?: string;
  razorpay_customer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  owner_name: string;
  category: string;
  country_code: string;
  is_auto_reply_enabled: boolean;
  auto_reply_delay_minutes: number;
  whatsapp_mode: 'MANUAL' | 'WHATSAPP_WEB' | 'CLOUD_API';
  whatsapp_phone_id?: string;
  encrypted_whatsapp_token?: string;
  webhook_secret: string;
  created_at: Date;
  updated_at: Date;
}

export interface CallRecord {
  id: string;
  business_id: string;
  phone_number: string;
  customer_name?: string;
  call_direction: 'INCOMING' | 'OUTGOING';
  call_status: 'MISSED' | 'ANSWERED' | 'REJECTED' | 'RINGING';
  duration_seconds: number;
  timestamp: number;
  source: string;
  created_at: Date;
  updated_at: Date;
}

export interface FollowUpRecord {
  id: string;
  call_id: string;
  business_id: string;
  phone_number: string;
  suggested_message: string;
  status: 'PENDING' | 'DRAFT' | 'SENT' | 'FAILED' | 'IGNORED';
  delay_seconds: number;
  scheduled_at?: Date;
  sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MessageRecord {
  id: string;
  business_id: string;
  followup_id?: string;
  phone_number: string;
  customer_name?: string;
  content: string;
  mode: 'MANUAL' | 'WHATSAPP_WEB' | 'CLOUD_API';
  status: 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  error_message?: string;
  sent_at?: Date;
  delivered_at?: Date;
  created_at: Date;
}

export interface WebhookEventRecord {
  id: string;
  provider: 'ANDROID_APP' | 'META_WHATSAPP';
  event_type: string;
  payload_hash: string;
  idempotency_key?: string;
  received_at: Date;
  processed_at?: Date;
  status: 'PENDING' | 'PROCESSED' | 'DUPLICATE' | 'FAILED';
  error_message?: string;
  raw_payload: any;
}
