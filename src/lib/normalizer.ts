export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return `+91 ${cleaned.substring(3, 8)} ${cleaned.substring(8)}`;
  }
  return phone;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function calculateSmsSegments(text: string): {
  chars: number;
  charCount: number;
  segments: number;
  isUnicode: boolean;
  remainingInSegment: number;
} {
  const charCount = text ? text.length : 0;
  const isUnicode = /[^\u0000-\u007F]/.test(text || "");
  const limitPerSegment = isUnicode ? 70 : 160;
  const multiLimit = isUnicode ? 67 : 153;

  let segments = 1;
  let remainingInSegment = limitPerSegment - charCount;

  if (charCount > limitPerSegment) {
    segments = Math.ceil(charCount / multiLimit);
    remainingInSegment = segments * multiLimit - charCount;
  } else if (charCount === 0) {
    segments = 0;
    remainingInSegment = limitPerSegment;
  }

  return {
    chars: charCount,
    charCount,
    segments,
    isUnicode,
    remainingInSegment,
  };
}
