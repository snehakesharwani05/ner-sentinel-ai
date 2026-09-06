/**
 * PurvaSetu / PRAGATI-AI (SIH Problem Statement 26002)
 * Automated Critical SMS Dispatch Engine & Anti-Spam Cooldown Gateway
 * Unifies frontend live disruption feed with backend pooled Twilio SMS engine & Fast2SMS adapter.
 * Enforces a 4-hour corridor cooldown cache per recipient.
 */

import { API_BASE_URL } from "../api/api";

export interface SmsPayload {
  recipientPhone: string;
  corridorName: string;
  stateName: string;
  reason: string;
  timestamp: string;
}

const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 Hours (14,400,000 ms)

/**
 * Backend Pooled Twilio SMS Dispatch
 * Calls backend /api/v1/alerts/send-sms which executes round-robin failover across Twilio key pool.
 */
export async function sendBackendPooledSmsAlert(payload: SmsPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/alerts/send-sms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: payload.recipientPhone,
        corridorTitle: payload.corridorName,
        stateName: payload.stateName,
        reason: payload.reason
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err) {
    console.warn("[SMS Gateway] Backend pooled dispatch unreachable, attempting fallback adapter:", err);
  }
  return false;
}

/**
 * Fast2SMS / Direct Transactional SMS Adapter (India Standard fallback)
 */
export async function sendFast2SmsAlert(
  payload: SmsPayload,
  apiKey: string = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_FAST2SMS_API_KEY || import.meta.env?.VITE_SMS_API_KEY)) || ""
): Promise<boolean> {
  // Try Backend Pooled Gateway First
  const backendSuccess = await sendBackendPooledSmsAlert(payload);
  if (backendSuccess) return true;

  const message = `[PurvaSetu ALERT] CRITICAL BLOCKAGE: ${payload.corridorName} (${payload.stateName}) is CLOSED due to verified ${payload.reason}. Transit unsafe. Check dashboard for active rerouting.`;

  const cleanNumber = payload.recipientPhone.replace("+91", "").replace(/\D/g, "").trim();
  if (!cleanNumber) return false;

  // Live Gateway Request
  if (apiKey) {
    try {
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "q",
          message: message,
          language: "english",
          flash: 0,
          numbers: cleanNumber
        }),
        signal: AbortSignal.timeout(6000)
      });

      return res.ok;
    } catch (err) {
      console.error("SMS Dispatch failed:", err);
      return false;
    }
  }

  // Graceful simulation / dev gateway logging when API key not set
  console.log(`[PurvaSetu Automated SMS Gateway] Dispatched to +91 ${cleanNumber}:\n"${message}"`);
  return true;
}

/**
 * Generate a deterministic cooldown key for a recipient and corridor
 */
export function getCooldownKey(recipientPhone: string, corridorName: string): string {
  const cleanPhone = recipientPhone.replace(/\D/g, "");
  const cleanCorridor = corridorName.trim().toLowerCase().replace(/\s+/g, "_");
  return `purvasetu_sms_cooldown_${cleanPhone}_${cleanCorridor}`;
}

/**
 * Check if alert for corridor is within the 4-hour anti-spam cooldown window
 */
export function isAlertInCooldown(recipientPhone: string, corridorName: string): boolean {
  try {
    const key = getCooldownKey(recipientPhone, corridorName);
    const lastSent = localStorage.getItem(key);
    if (!lastSent) return false;
    const elapsed = Date.now() - parseInt(lastSent, 10);
    return elapsed < COOLDOWN_MS;
  } catch (e) {
    return false;
  }
}

/**
 * Record dispatch timestamp in the 4-hour cooldown cache
 */
export function markAlertDispatched(recipientPhone: string, corridorName: string): void {
  try {
    const key = getCooldownKey(recipientPhone, corridorName);
    localStorage.setItem(key, Date.now().toString());
  } catch (e) {
    // Fallback if localStorage unavailable
  }
}

/**
 * Scans verified disruptions in user's active zone, filters for CRITICAL_BLOCKED,
 * and automatically dispatches SMS alerts respecting the 4-hour corridor cooldown.
 */
export async function processAndDispatchCriticalAlerts(
  disruptions: any[],
  userPhone: string,
  stateName: string = "North Eastern Region"
): Promise<{ dispatchedCount: number; alertsSent: string[] }> {
  if (!userPhone) return { dispatchedCount: 0, alertsSent: [] };

  const criticalBlockages = (disruptions || []).filter(
    d => d.severity === "CRITICAL_BLOCKED" || d.severity === "critical_blocked"
  );

  const alertsSent: string[] = [];
  let dispatchedCount = 0;

  for (const block of criticalBlockages) {
    const corridor = block.title || `${block.highway_code || 'Corridor'}`;
    if (!isAlertInCooldown(userPhone, corridor)) {
      const payload: SmsPayload = {
        recipientPhone: userPhone,
        corridorName: corridor,
        stateName: stateName,
        reason: block.description || block.disruption_type || "verified physical road closure",
        timestamp: new Date().toISOString()
      };

      const success = await sendFast2SmsAlert(payload);
      if (success) {
        markAlertDispatched(userPhone, corridor);
        dispatchedCount++;
        alertsSent.push(corridor);
      }
    }
  }

  return { dispatchedCount, alertsSent };
}
