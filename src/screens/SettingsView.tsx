import React, { useState } from "react";
import {
  Settings,
  Building,
  Clock,
  Smartphone,
  Save,
  CheckCircle2,
  Key,
  Shield,
  Radio,
} from "lucide-react";
import { BusinessSettings } from "../types";

interface SettingsViewProps {
  settings: BusinessSettings;
  onUpdateSettings: (settings: BusinessSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [form, setForm] = useState<BusinessSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Business Settings</h1>
          <p className="text-xs text-[#8696A0] mt-0.5">
            Configure business details, working hours schedule, and WhatsApp sending mode
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings successfully saved and synchronized across telephony services!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile Card */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222E35]">
            <Building className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-sm font-bold text-white">Business Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Owner / Representative Name
              </label>
              <input
                type="text"
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Default Country Code
              </label>
              <input
                type="text"
                required
                value={form.defaultCountryCode}
                onChange={(e) => setForm({ ...form, defaultCountryCode: e.target.value })}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Default Outbound SIM Card
              </label>
              <select
                value={form.defaultSmsSim}
                onChange={(e) => setForm({ ...form, defaultSmsSim: e.target.value as any })}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
              >
                <option value="SIM 1 (Airtel)">SIM 1 (Airtel)</option>
                <option value="SIM 2 (Jio)">SIM 2 (Jio)</option>
              </select>
            </div>
          </div>
        </div>

        {/* WhatsApp Sending Mode Card */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222E35]">
            <Smartphone className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-sm font-bold text-white">WhatsApp Sending Mode</h2>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: "MANUAL",
                title: "Mode 1: Manual Intent (Android Deep Link)",
                desc: "Safest mode. Opens WhatsApp conversation with pre-filled text for manual tap-to-send.",
              },
              {
                id: "WHATSAPP_WEB",
                title: "Mode 2: WhatsApp Web (Browser Session Bridge)",
                desc: "Connects via QR Code scanning. Automatically sends background follow-ups via linked session.",
              },
              {
                id: "CLOUD_API",
                title: "Mode 3: Official Meta Cloud API (Headless)",
                desc: "High volume enterprise messaging using official Meta WhatsApp Business API tokens.",
              },
            ].map((m) => (
              <label
                key={m.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  form.whatsAppSendingMode === m.id
                    ? "bg-[#202C33] border-[#00A884]"
                    : "bg-[#202C33]/40 border-[#222E35] hover:bg-[#202C33]"
                }`}
              >
                <input
                  type="radio"
                  name="sendingMode"
                  checked={form.whatsAppSendingMode === m.id}
                  onChange={() => setForm({ ...form, whatsAppSendingMode: m.id as any })}
                  className="accent-[#00A884] w-4 h-4 mt-0.5"
                />
                <div>
                  <span className="text-xs font-bold text-white block">{m.title}</span>
                  <span className="text-[11px] text-[#8696A0] mt-0.5 block">{m.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {form.whatsAppSendingMode === "CLOUD_API" && (
            <div className="p-4 rounded-xl bg-[#0C1317] border border-[#222E35] space-y-3 mt-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Meta Cloud API Credentials
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Meta Access Token (EAAG...)"
                  value={form.metaAccessToken || ""}
                  onChange={(e) => setForm({ ...form, metaAccessToken: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00A884]"
                />
                <input
                  type="text"
                  placeholder="Meta Phone Number ID (e.g. 104829104819)"
                  value={form.metaPhoneNumberId || ""}
                  onChange={(e) => setForm({ ...form, metaPhoneNumberId: e.target.value })}
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00A884]"
                />
              </div>
            </div>
          )}

          {/* Auto reply switch */}
          <div className="pt-3 border-t border-[#222E35] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Enable Automated Follow-up Dispatch</p>
              <p className="text-[11px] text-[#8696A0]">
                If disabled, incoming missed calls create pending suggestions for review
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.isAutoReplyEnabled}
              onChange={(e) => setForm({ ...form, isAutoReplyEnabled: e.target.checked })}
              className="accent-[#00A884] w-5 h-5 rounded"
            />
          </div>
        </div>

        {/* Working Hours Schedule Card */}
        <div className="p-5 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222E35]">
            <Clock className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-sm font-bold text-white">Working Hours Schedule</h2>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-200 font-semibold">
              Restrict automated responses to working hours
            </span>
            <input
              type="checkbox"
              checked={form.workingHoursEnabled}
              onChange={(e) => setForm({ ...form, workingHoursEnabled: e.target.checked })}
              className="accent-[#00A884] w-5 h-5 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={form.workingHoursStart}
                onChange={(e) => setForm({ ...form, workingHoursStart: e.target.value })}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                End Time
              </label>
              <input
                type="time"
                value={form.workingHoursEnd}
                onChange={(e) => setForm({ ...form, workingHoursEnd: e.target.value })}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all shadow-md shadow-[#00A884]/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
