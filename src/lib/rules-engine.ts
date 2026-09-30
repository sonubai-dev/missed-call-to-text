import { Customer, DispatchRule, BusinessSettings, CallEvent } from "../types";

export interface EvaluationResult {
  matchedRule: DispatchRule | null;
  shouldDispatch: boolean;
  cooldownActive: boolean;
  isBlacklisted: boolean;
  isOutsideWorkingHours: boolean;
  reason: string;
}

export function evaluateCallRules(
  phoneNumber: string,
  customer: Customer | null,
  rules: DispatchRule[],
  settings: BusinessSettings,
  recentCalls: CallEvent[]
): EvaluationResult {
  // 1. Blacklist check
  if (customer && customer.isBlacklisted) {
    return {
      matchedRule: null,
      shouldDispatch: false,
      cooldownActive: false,
      isBlacklisted: true,
      isOutsideWorkingHours: false,
      reason: "Number is marked as blacklisted / spam",
    };
  }

  // 2. Working hours check
  let isOutside = false;
  if (settings.workingHoursEnabled) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = settings.workingHoursStart.split(":").map(Number);
    const [endH, endM] = settings.workingHoursEnd.split(":").map(Number);
    const startMinutes = (startH || 9) * 60 + (startM || 0);
    const endMinutes = (endH || 18) * 60 + (endM || 0);

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      isOutside = true;
    }
  }

  // 3. Cooldown & Anti-Spam protection:
  // Check if this number has had a follow-up sent within the last cooldown period
  const activeRules = rules.filter((r) => r.isEnabled).sort((a, b) => a.priority - b.priority);

  for (const rule of activeRules) {
    // Check condition match
    let matchesCondition = false;
    if (rule.conditionType === "ALL_MISSED") {
      matchesCondition = true;
    } else if (rule.conditionType === "FIRST_TIME") {
      matchesCondition = !customer || customer.totalMissedCalls <= 1;
    } else if (rule.conditionType === "VIP_ONLY") {
      matchesCondition = customer?.isVip === true;
    } else if (rule.conditionType === "AFTER_HOURS") {
      matchesCondition = isOutside;
    }

    if (rule.workingHoursOnly && isOutside && rule.conditionType !== "AFTER_HOURS") {
      continue;
    }

    if (matchesCondition) {
      // Check cooldown for this rule on this phone number
      const cooldownMs = (rule.cooldownMinutes || 60) * 60 * 1000;
      const recentCallForNumber = recentCalls.find(
        (c) => c.phoneNumber === phoneNumber && (c.whatsappStatus === "SENT" || c.status === "MISSED") && Date.now() - c.timestamp < cooldownMs
      );

      if (recentCallForNumber && recentCallForNumber.whatsappStatus === "SENT") {
        return {
          matchedRule: rule,
          shouldDispatch: false,
          cooldownActive: true,
          isBlacklisted: false,
          isOutsideWorkingHours: isOutside,
          reason: `Anti-Spam Cooldown active (${rule.cooldownMinutes}m cooldown window)`,
        };
      }

      return {
        matchedRule: rule,
        shouldDispatch: settings.isAutoReplyEnabled,
        cooldownActive: false,
        isBlacklisted: false,
        isOutsideWorkingHours: isOutside,
        reason: `Matched rule "${rule.name}" with priority #${rule.priority}`,
      };
    }
  }

  return {
    matchedRule: null,
    shouldDispatch: settings.isAutoReplyEnabled,
    cooldownActive: false,
    isBlacklisted: false,
    isOutsideWorkingHours: isOutside,
    reason: "Default follow-up policy applied",
  };
}
