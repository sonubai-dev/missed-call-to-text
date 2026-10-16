import React, { useState } from "react";
import {
  Webhook,
  Code,
  ShieldCheck,
  RefreshCw,
  Send,
  CheckCircle,
  Copy,
  ExternalLink,
  Lock,
} from "lucide-react";
import { WebhookEventLog, BusinessSettings } from "../types";
import { formatRelativeTime } from "../lib/normalizer";

interface WebhooksViewProps {
  webhooks: WebhookEventLog[];
  settings: BusinessSettings;
  onUpdateSettings: (settings: BusinessSettings) => void;
  onSendTestWebhook: () => void;
}

export const WebhooksView: React.FC<WebhooksViewProps> = ({
  webhooks,
  settings,
  onUpdateSettings,
  onSendTestWebhook,
}) => {
  const [url, setUrl] = useState(settings.webhookUrl || "");
  const [secret, setSecret] = useState(settings.webhookSecret || "");
  const [isEnabled, setIsEnabled] = useState(settings.isWebhookEnabled ?? true);
  const [copied, setCopied] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebhookEventLog | null>(
    webhooks.length > 0 ? webhooks[0] : null
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      webhookUrl: (url || "").trim(),
      webhookSecret: (secret || "").trim(),
      isWebhookEnabled: isEnabled,
    });
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Developer Webhooks & CRM Sync
          </h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Push real-time call and message events to external servers with cryptographic HMAC-SHA256 signatures
          </p>
        </div>

        <button
          onClick={onSendTestWebhook}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/30"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Test Ping</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: Configuration Form (1 col) */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#222E35]">
            <Webhook className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Endpoint Configuration</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#202C33]/60 border border-[#222E35]">
              <div>
                <p className="text-xs font-bold text-white">Enable Webhooks</p>
                <p className="text-[10px] text-[#8696A0]">Live HTTP POST dispatches</p>
              </div>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="accent-[#00A884] w-4 h-4 rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Target Webhook URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-crm.com/api/webhooks"
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#8696A0]">
                  HMAC SHA-256 Signing Secret
                </label>
                <button
                  type="button"
                  onClick={copySecret}
                  className="text-[10px] text-purple-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#202C33]/40 border border-[#222E35] text-[11px] text-[#8696A0] space-y-1.5">
              <p className="font-semibold text-white">Security Headers Included:</p>
              <p className="font-mono text-[10px] text-gray-300">
                X-Signature-SHA256: hmac_sha256(payload, secret)
              </p>
              <p className="font-mono text-[10px] text-gray-300">
                X-Event-ID: CALL_8f9a2b (Idempotency key)
              </p>
              <p className="font-mono text-[10px] text-gray-300">
                X-Timestamp: 1694183421000
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20"
            >
              Save Configuration
            </button>
          </form>
        </div>

        {/* Right col: Event Delivery Log & JSON Inspector (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-[#111B21] border border-[#222E35] overflow-hidden">
            <div className="p-4 border-b border-[#222E35] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Recent Webhook Deliveries ({webhooks.length})
              </h3>
              <span className="text-xs text-[#8696A0]">Exponential Backoff Queue Active</span>
            </div>

            <div className="divide-y divide-[#222E35]/60 max-h-60 overflow-y-auto">
              {webhooks.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? "bg-[#202C33]" : "hover:bg-[#182229]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          log.statusCode === 200
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {log.statusCode} OK
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">{log.eventType}</span>
                        <span className="text-[10px] text-[#8696A0] font-mono">
                          ID: {log.idempotencyKey}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-[#8696A0]">
                      <span className="font-mono text-purple-400 block">{log.responseTimeMs}ms</span>
                      <span>{formatRelativeTime(log.timestamp)}</span>
                    </div>
                  </div>
                );
              })}

              {webhooks.length === 0 && (
                <div className="py-12 text-center text-[#8696A0] text-xs">
                  No webhooks dispatched yet. Click "Dispatch Test Ping" to send one.
                </div>
              )}
            </div>
          </div>

          {/* JSON Payload Inspector */}
          {selectedLog && (
            <div className="rounded-2xl bg-[#090D10] border border-[#222E35] overflow-hidden">
              <div className="p-3 bg-[#111B21] border-b border-[#222E35] flex items-center justify-between text-xs">
                <span className="font-mono text-gray-300 font-bold">
                  Payload Inspector: {selectedLog.eventType}
                </span>
                <span className="text-[#8696A0] font-mono text-[10px]">
                  Signature: {selectedLog.signature.slice(0, 18)}...
                </span>
              </div>
              <div className="p-4 overflow-x-auto max-h-56">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
