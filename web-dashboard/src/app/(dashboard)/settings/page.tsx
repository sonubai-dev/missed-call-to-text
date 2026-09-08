"use client";

import { useEffect, useState } from "react";
import { BusinessSettings } from "@/types";
import { Settings, Building, Clock, Smartphone, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setSettings(await res.json());
    } catch (e) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: Partial<BusinessSettings> = {
      businessName: formData.get("businessName") as string,
      ownerName: formData.get("ownerName") as string,
      defaultCountryCode: formData.get("defaultCountryCode") as string,
      isAutoReplyEnabled: formData.get("isAutoReplyEnabled") === "on",
      autoReplyDelayMinutes: parseInt(formData.get("autoReplyDelayMinutes") as string, 10) || 1,
      workingHoursEnabled: formData.get("workingHoursEnabled") === "on",
      workingHoursStart: formData.get("workingHoursStart") as string,
      workingHoursEnd: formData.get("workingHoursEnd") as string,
      whatsAppSendingMode: formData.get("whatsAppSendingMode") as BusinessSettings["whatsAppSendingMode"],
    };

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSettings(await res.json());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-[#8696A0]">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Business Settings</h1>
        <p className="text-sm text-[#8696A0]">
          Configure business details, working hours, and WhatsApp sending preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile Card */}
        <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222E35]">
            <Building className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-base font-bold text-white">Business Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Business Name
              </label>
              <input
                name="businessName"
                defaultValue={settings.businessName}
                required
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Owner Name
              </label>
              <input
                name="ownerName"
                defaultValue={settings.ownerName}
                required
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                Default Country Code
              </label>
              <input
                name="defaultCountryCode"
                defaultValue={settings.defaultCountryCode}
                required
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>
          </div>
        </div>

        {/* Sending Mode & Delay Card */}
        <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222E35]">
            <Smartphone className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-base font-bold text-white">WhatsApp Sending Mode</h2>
          </div>

          <div className="space-y-3">
            {[
              { id: "MANUAL", label: "Mode 1: Manual (Safe Android Intent deep-link)" },
              { id: "WHATSAPP_WEB", label: "Mode 2: WhatsApp Web (Browser Session Bridge)" },
              { id: "CLOUD_API", label: "Mode 3: Official Meta Cloud API (Headless)" },
            ].map((m) => (
              <label key={m.id} className="flex items-center gap-3 text-sm text-gray-200 cursor-pointer">
                <input
                  type="radio"
                  name="whatsAppSendingMode"
                  value={m.id}
                  defaultChecked={settings.whatsAppSendingMode === m.id}
                  className="accent-[#00A884] w-4 h-4"
                />
                <span>{m.label}</span>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-[#222E35] flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Enable Automated Follow-up</p>
              <p className="text-xs text-[#8696A0]">
                If disabled, app creates pending suggestions for manual review
              </p>
            </div>
            <input
              type="checkbox"
              name="isAutoReplyEnabled"
              defaultChecked={settings.isAutoReplyEnabled}
              className="accent-[#00A884] w-5 h-5 rounded"
            />
          </div>
        </div>

        {/* Working Hours Card */}
        <div className="p-6 rounded-2xl bg-[#111B21] border border-[#222E35] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222E35]">
            <Clock className="w-5 h-5 text-[#00A884]" />
            <h2 className="text-base font-bold text-white">Working Hours Schedule</h2>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-200 font-medium">Restrict auto-replies to working hours</span>
            <input
              type="checkbox"
              name="workingHoursEnabled"
              defaultChecked={settings.workingHoursEnabled}
              className="accent-[#00A884] w-5 h-5 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">Start Time</label>
              <input
                type="time"
                name="workingHoursStart"
                defaultValue={settings.workingHoursStart}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8696A0] mb-1">End Time</label>
              <input
                type="time"
                name="workingHoursEnd"
                defaultValue={settings.workingHoursEnd}
                className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00A884]"
              />
            </div>
          </div>
        </div>

        {/* Action Button & Confirmation */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#25D366]">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved Successfully!
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-sm font-bold text-white shadow-lg shadow-[#00A884]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
