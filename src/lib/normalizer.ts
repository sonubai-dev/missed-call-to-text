export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  if (cleaned.startsWith("+1") && cleaned.length === 12) {
    return `+1 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
  }
  return phone;
}

export function normalizePhoneNumber(phone: string, defaultCountryCode: string = "+91"): string {
  if (!phone) return "";
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }
    const cleanPrefix = defaultCountryCode.startsWith("+") ? defaultCountryCode : `+${defaultCountryCode}`;
    cleaned = `${cleanPrefix}${cleaned}`;
  }
  return cleaned;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export interface SmsCalculation {
  charCount: number;
  segments: number;
  isUnicode: boolean;
  maxCharsPerSegment: number;
  remainingInSegment: number;
}

export function calculateSmsSegments(text: string): SmsCalculation {
  const charCount = text.length;
  // Check if unicode exists (outside GSM 7-bit charset)
  const isUnicode = /[^\u0000-\u007F]/.test(text);
  const maxCharsPerSegment = isUnicode ? (charCount > 70 ? 67 : 70) : (charCount > 160 ? 153 : 160);
  const segments = charCount === 0 ? 0 : Math.ceil(charCount / maxCharsPerSegment);
  const remainingInSegment = charCount === 0 ? maxCharsPerSegment : (segments * maxCharsPerSegment) - charCount;

  return {
    charCount,
    segments: Math.max(1, segments),
    isUnicode,
    maxCharsPerSegment,
    remainingInSegment,
  };
}
