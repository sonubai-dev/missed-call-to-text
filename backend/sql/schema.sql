-- MissCall WhatsApp Assistant PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'INACTIVE', -- 'INACTIVE', 'ACTIVE', 'CANCELLED'
    subscription_id VARCHAR(255),
    razorpay_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Business Profile Table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'My Business',
    owner_name VARCHAR(255) NOT NULL DEFAULT 'Owner',
    category VARCHAR(100) NOT NULL DEFAULT 'General Support',
    country_code VARCHAR(10) NOT NULL DEFAULT '91',
    is_auto_reply_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_reply_delay_minutes INT NOT NULL DEFAULT 1,
    whatsapp_mode VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- 'MANUAL', 'WHATSAPP_WEB', 'CLOUD_API'
    whatsapp_phone_id VARCHAR(100),
    encrypted_whatsapp_token TEXT,
    webhook_secret VARCHAR(255) NOT NULL DEFAULT 'whsec_default_secret_key',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Calls Table
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    call_direction VARCHAR(20) NOT NULL DEFAULT 'INCOMING',
    call_status VARCHAR(30) NOT NULL DEFAULT 'MISSED', -- 'MISSED', 'ANSWERED', 'REJECTED', 'RINGING'
    duration_seconds INT NOT NULL DEFAULT 0,
    timestamp BIGINT NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'TELECOM_SCREENING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_business_timestamp ON calls(business_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_calls_phone ON calls(phone_number);

-- 4. Follow-Ups Table
CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    phone_number VARCHAR(50) NOT NULL,
    suggested_message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'DRAFT', 'SENT', 'FAILED', 'IGNORED'
    delay_seconds INT NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_followups_business_status ON followups(business_id, status);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    followup_id UUID REFERENCES followups(id) ON DELETE SET NULL,
    phone_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255),
    content TEXT NOT NULL,
    mode VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED', -- 'QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'FAILED'
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_business_created ON messages(business_id, created_at DESC);

-- 6. Webhook Events Table (Auditing, Replay Protection, Idempotency & Retries)
CREATE TABLE IF NOT EXISTS webhook_events (
    id VARCHAR(128) PRIMARY KEY,
    provider VARCHAR(64) NOT NULL, -- 'ANDROID_APP', 'META_WHATSAPP'
    event_type VARCHAR(64) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(128),
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'DUPLICATE', 'FAILED'
    error_message TEXT,
    raw_payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_hash ON webhook_events(payload_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency ON webhook_events(idempotency_key);
