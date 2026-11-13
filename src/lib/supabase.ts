import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vuundjerldvxowqgaudi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dW5kamVybGR2eG93cWdhdWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NDMyODcsImV4cCI6MjExMDExOTI4N30.2P_ZdbVT-r4tpAKFxqM_RoWRadoUhE1EyiFYY4Z-ozc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Device {
  id: string;
  device_id: string;
  business_name: string;
  owner_name?: string;
  phone?: string;
  status: 'trial' | 'active' | 'expired' | 'halted' | 'cancelled';
  trial_ends_at: string;
  valid_until: string;
  razorpay_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  device_id: string;
  phone_number: string;
  name: string;
  company?: string;
  total_missed_calls: number;
  last_call_timestamp: string;
  is_vip: boolean;
  is_blacklisted: boolean;
  notes?: string;
}

export interface MissedCall {
  id: string;
  device_id: string;
  customer_id?: string;
  phone_number: string;
  customer_name?: string;
  call_time: string;
  call_status: 'MISSED' | 'ANSWERED' | 'REJECTED' | 'RINGING';
  whatsapp_status: 'PENDING' | 'SENT' | 'SCHEDULED' | 'FAILED' | 'IGNORED';
  suggested_message?: string;
  notes?: string;
}

export interface MessageRecord {
  id: string;
  device_id: string;
  phone_number: string;
  customer_name?: string;
  content: string;
  status: 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  mode: 'MANUAL' | 'WHATSAPP_WEB' | 'CLOUD_API';
  sent_at: string;
}
