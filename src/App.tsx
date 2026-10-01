import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar, NavTab } from "./components/Sidebar";
import { CustomerDetailModal } from "./components/CustomerDetailModal";
import { AuthPaywallModal } from "./components/AuthPaywallModal";
import { QrCodeScannerModal } from "./components/QrCodeScannerModal";

import { DashboardView } from "./screens/DashboardView";
import { MissedCallsView } from "./screens/MissedCallsView";
import { CustomersView } from "./screens/CustomersView";
import { FollowUpsView } from "./screens/FollowUpsView";
import { WhatsAppWorkbenchView } from "./screens/WhatsAppWorkbenchView";
import { SmsHistoryView } from "./screens/SmsHistoryView";
import { RulesView } from "./screens/RulesView";
import { TemplatesView } from "./screens/TemplatesView";
import { SimulatorView } from "./screens/SimulatorView";
import { WebhooksView } from "./screens/WebhooksView";
import { SettingsView } from "./screens/SettingsView";
import { DownloadView } from "./screens/DownloadView";

import { appStorage } from "./lib/storage";
import {
  CallEvent,
  Customer,
  FollowUpSuggestion,
  MessageRecord,
  MessageTemplate,
  DispatchRule,
  BusinessSettings,
  WebhookEventLog,
  UserAccount,
  WhatsAppConnectionStatus,
  ChannelType,
} from "./types";

export default function App() {
  // Main Data States loaded from Storage
  const [calls, setCalls] = useState<CallEvent[]>(() => appStorage.getCalls());
  const [customers, setCustomers] = useState<Customer[]>(() => appStorage.getCustomers());
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>(() => appStorage.getSuggestions());
  const [messages, setMessages] = useState<MessageRecord[]>(() => appStorage.getMessages());
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => appStorage.getTemplates());
  const [rules, setRules] = useState<DispatchRule[]>(() => appStorage.getRules());
  const [settings, setSettings] = useState<BusinessSettings>(() => appStorage.getSettings());
  const [webhooks, setWebhooks] = useState<WebhookEventLog[]>(() => appStorage.getWebhooks());
  const [session, setSession] = useState<{ status: WhatsAppConnectionStatus; linkedNumber?: string }>(() =>
    appStorage.getSession()
  );
  const [user, setUser] = useState<UserAccount>(() => appStorage.getUser());

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/download")) {
      return "download";
    }
    return "dashboard";
  });
  const [targetPhoneForWhatsApp, setTargetPhoneForWhatsApp] = useState<string | undefined>(undefined);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/download")) {
        setCurrentTab("download");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Sync to Storage
  useEffect(() => {
    appStorage.saveCalls(calls);
  }, [calls]);

  useEffect(() => {
    appStorage.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    appStorage.saveSuggestions(suggestions);
  }, [suggestions]);

  useEffect(() => {
    appStorage.saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    appStorage.saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    appStorage.saveRules(rules);
  }, [rules]);

  useEffect(() => {
    appStorage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    appStorage.saveWebhooks(webhooks);
  }, [webhooks]);

  useEffect(() => {
    appStorage.saveSession(session);
  }, [session]);

  useEffect(() => {
    appStorage.saveUser(user);
  }, [user]);

  // Actions
  const handleOpenMessageForCall = (call: CallEvent) => {
    setTargetPhoneForWhatsApp(call.phoneNumber);
    setCurrentTab("whatsapp");
  };

  const handleOpenMessageForPhone = (phoneNumber: string, name?: string) => {
    setTargetPhoneForWhatsApp(phoneNumber);
    setCurrentTab("whatsapp");
  };

  const handleIgnoreCall = (callId: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, whatsappStatus: "IGNORED" } : c))
    );
  };

  const handleAddCustomer = (newCust: Omit<Customer, "id">) => {
    const cust: Customer = {
      id: `cust-${Date.now()}`,
      ...newCust,
    };
    setCustomers((prev) => [cust, ...prev]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedCustomer(updated);
  };

  const handleSelectCustomerByPhone = (phoneNumber: string) => {
    const cust = customers.find(
      (c) => c.phoneNumber.replace(/\s+/g, "") === phoneNumber.replace(/\s+/g, "")
    );
    if (cust) {
      setSelectedCustomer(cust);
    } else {
      // Create ad-hoc customer view
      const tempCust: Customer = {
        id: `cust-temp-${Date.now()}`,
        name: "Unknown Caller",
        phoneNumber,
        isVip: false,
        isBlacklisted: false,
        totalMissedCalls: 1,
        lastCallTimestamp: Date.now(),
        status: "NEW",
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            customerId: "",
            type: "MISSED_CALL",
            description: `Missed call from ${phoneNumber}`,
            timestamp: Date.now(),
          },
        ],
      };
      setSelectedCustomer(tempCust);
    }
  };

  const handleSendWhatsAppMessage = ({
    callEventId,
    phoneNumber,
    customerName,
    content,
  }: {
    callEventId?: string;
    phoneNumber: string;
    customerName?: string;
    content: string;
  }) => {
    const newMsg: MessageRecord = {
      id: `msg-${Date.now()}`,
      callEventId,
      phoneNumber,
      customerName,
      content,
      timestamp: Date.now(),
      status: "QUEUED",
      mode: settings.whatsAppSendingMode,
      channel: "WHATSAPP",
    };

    setMessages((prev) => [newMsg, ...prev]);

    // Update corresponding call event if exists
    if (callEventId) {
      setCalls((prev) =>
        prev.map((c) => (c.id === callEventId ? { ...c, whatsappStatus: "SENT" } : c))
      );
    } else {
      // Find call with this phone
      setCalls((prev) =>
        prev.map((c) => (c.phoneNumber === phoneNumber ? { ...c, whatsappStatus: "SENT" } : c))
      );
    }

    // Remove from suggestions if any
    setSuggestions((prev) => prev.filter((s) => s.phoneNumber !== phoneNumber));

    // Update customer activity
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.phoneNumber.replace(/\s+/g, "") === phoneNumber.replace(/\s+/g, "")) {
          const act = {
            id: `act-${Date.now()}`,
            customerId: c.id,
            type: "WHATSAPP_SENT" as const,
            description: `Dispatched WhatsApp follow-up: "${content.substring(0, 45)}..."`,
            timestamp: Date.now(),
            channel: "WHATSAPP" as const,
          };
          return {
            ...c,
            status: c.status === "NEW" ? "CONTACTED" : c.status,
            activityHistory: [act, ...(c.activityHistory || [])],
          };
        }
        return c;
      })
    );

    // Simulate delivery ticks transition: QUEUED -> SENDING -> SENT -> DELIVERED
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "SENDING" } : m))
      );
    }, 400);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "SENT" } : m))
      );
    }, 900);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, status: "DELIVERED" } : m))
      );
    }, 1800);

    // Dispatch Webhook Event
    const whLog: WebhookEventLog = {
      id: `wh-${Date.now()}`,
      eventType: "whatsapp_sent",
      timestamp: Date.now(),
      statusCode: 200,
      signature: `sha256=${Math.random().toString(36).substring(2, 20)}`,
      responseTimeMs: Math.floor(Math.random() * 80) + 40,
      idempotencyKey: `MSG_${Math.random().toString(36).substring(2, 9)}`,
      payload: {
        event_type: "whatsapp_sent",
        recipient: phoneNumber,
        customer_name: customerName,
        message: content,
        mode: settings.whatsAppSendingMode,
      },
    };
    setWebhooks((prev) => [whLog, ...prev]);
  };

  const handleSendCarrierSms = (sms: {
    phoneNumber: string;
    content: string;
    simSlot: string;
  }) => {
    const newMsg: MessageRecord = {
      id: `msg-sms-${Date.now()}`,
      phoneNumber: sms.phoneNumber,
      content: sms.content,
      timestamp: Date.now(),
      status: "SENT",
      mode: sms.simSlot.includes("SIM 1") ? "SMS_SIM1" : "SMS_SIM2",
      channel: "SMS",
      simSlot: sms.simSlot,
    };
    setMessages((prev) => [newMsg, ...prev]);

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.phoneNumber.replace(/\s+/g, "") === sms.phoneNumber.replace(/\s+/g, "")) {
          const act = {
            id: `act-${Date.now()}`,
            customerId: c.id,
            type: "SMS_SENT" as const,
            description: `Sent native SMS via ${sms.simSlot}: "${sms.content.substring(0, 45)}..."`,
            timestamp: Date.now(),
            channel: "SMS" as const,
          };
          return {
            ...c,
            activityHistory: [act, ...(c.activityHistory || [])],
          };
        }
        return c;
      })
    );
  };

  const handleApproveSuggestion = (
    suggestion: FollowUpSuggestion,
    editedContent?: string,
    channel?: ChannelType
  ) => {
    const textToSend = editedContent || suggestion.suggestedMessage;
    const targetChannel = channel || suggestion.channel || "WHATSAPP";

    if (targetChannel === "WHATSAPP") {
      handleSendWhatsAppMessage({
        callEventId: suggestion.callEventId,
        phoneNumber: suggestion.phoneNumber,
        customerName: suggestion.customerName,
        content: textToSend,
      });
    } else {
      handleSendCarrierSms({
        phoneNumber: suggestion.phoneNumber,
        content: textToSend,
        simSlot: settings.defaultSmsSim,
      });
    }

    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  const handleDismissSuggestion = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSimulatorCallProcessed = (
    newCall: CallEvent,
    _newCust?: Customer,
    autoDispatchedMessage?: string
  ) => {
    setCalls((prev) => [newCall, ...prev]);

    // Check or create customer
    const existing = customers.find(
      (c) => c.phoneNumber.replace(/\s+/g, "") === newCall.phoneNumber.replace(/\s+/g, "")
    );

    if (existing) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalMissedCalls: c.totalMissedCalls + 1,
                lastCallTimestamp: Date.now(),
                activityHistory: [
                  {
                    id: `act-${Date.now()}`,
                    customerId: c.id,
                    type: "MISSED_CALL" as const,
                    description: `Missed call detected on ${newCall.simSlot || "SIM 1"}`,
                    timestamp: Date.now(),
                  },
                  ...(c.activityHistory || []),
                ],
              }
            : c
        )
      );
    } else {
      const created: Customer = {
        id: `cust-${Date.now()}`,
        name: newCall.customerName || "First-Time Caller",
        phoneNumber: newCall.phoneNumber,
        isVip: false,
        isBlacklisted: newCall.whatsappStatus === "IGNORED",
        totalMissedCalls: 1,
        lastCallTimestamp: Date.now(),
        status: "NEW",
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            customerId: "",
            type: "MISSED_CALL" as const,
            description: `First missed call received on ${newCall.simSlot || "SIM 1"}`,
            timestamp: Date.now(),
          },
        ],
      };
      setCustomers((prev) => [created, ...prev]);
    }

    if (autoDispatchedMessage) {
      handleSendWhatsAppMessage({
        callEventId: newCall.id,
        phoneNumber: newCall.phoneNumber,
        customerName: newCall.customerName,
        content: autoDispatchedMessage,
      });
    } else if (newCall.whatsappStatus === "PENDING") {
      const newSug: FollowUpSuggestion = {
        id: `sug-${Date.now()}`,
        callEventId: newCall.id,
        phoneNumber: newCall.phoneNumber,
        customerName: newCall.customerName,
        suggestedMessage: newCall.suggestedMessage,
        status: "PENDING",
        createdAt: Date.now(),
        channel: "WHATSAPP",
      };
      setSuggestions((prev) => [newSug, ...prev]);
    }
  };

  const handleResetData = () => {
    if (confirm("Reset all local CRM and telephony data back to initial seeds?")) {
      appStorage.resetAll();
      window.location.reload();
    }
  };

  const handleConnectWhatsAppSession = (phoneNumber: string) => {
    setSession({
      status: "CONNECTED",
      linkedNumber: phoneNumber,
    });
  };

  const handleDisconnectWhatsAppSession = () => {
    setSession({
      status: "DISCONNECTED",
      linkedNumber: undefined,
    });
  };

  const handleSendTestWebhook = () => {
    const testLog: WebhookEventLog = {
      id: `wh-${Date.now()}`,
      eventType: "test_ping",
      timestamp: Date.now(),
      statusCode: 200,
      signature: `sha256=${Math.random().toString(36).substring(2, 24)}`,
      responseTimeMs: Math.floor(Math.random() * 50) + 30,
      idempotencyKey: `TEST_${Math.random().toString(36).substring(2, 9)}`,
      payload: {
        event: "test_ping",
        message: "Webhook connectivity test from MissCall Assistant",
        timestamp: new Date().toISOString(),
      },
    };
    setWebhooks((prev) => [testLog, ...prev]);
  };

  const pendingCount = suggestions.length;
  const missedCount = calls.filter((c) => c.whatsappStatus === "PENDING").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0C1317] text-[#E9EDEF]">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingCount={pendingCount}
        missedCount={missedCount}
        customerCount={customers.length}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          sessionStatus={session.status}
          linkedNumber={session.linkedNumber}
          user={user}
          onOpenSimulator={() => setCurrentTab("simulator")}
          onOpenPaywall={() => setIsPaywallOpen(true)}
          onResetData={handleResetData}
          onOpenDownload={() => setCurrentTab("download")}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0C1317]">
          {currentTab === "dashboard" && (
            <DashboardView
              calls={calls}
              messages={messages}
              customers={customers}
              suggestions={suggestions}
              sessionStatus={session.status}
              settings={settings}
              onNavigate={setCurrentTab}
              onOpenMessageForCall={handleOpenMessageForCall}
              onIgnoreCall={handleIgnoreCall}
              onApproveSuggestion={handleApproveSuggestion}
              onOpenSimulator={() => setCurrentTab("simulator")}
            />
          )}

          {currentTab === "calls" && (
            <MissedCallsView
              calls={calls}
              onOpenMessage={handleOpenMessageForCall}
              onIgnoreCall={handleIgnoreCall}
              onSelectCustomer={handleSelectCustomerByPhone}
            />
          )}

          {currentTab === "customers" && (
            <CustomersView
              customers={customers}
              onSelectCustomer={setSelectedCustomer}
              onAddCustomer={handleAddCustomer}
              onSendMessage={handleOpenMessageForPhone}
            />
          )}

          {currentTab === "followups" && (
            <FollowUpsView
              suggestions={suggestions}
              onApprove={handleApproveSuggestion}
              onDismiss={handleDismissSuggestion}
            />
          )}

          {currentTab === "whatsapp" && (
            <WhatsAppWorkbenchView
              calls={calls}
              messages={messages}
              templates={templates}
              sessionStatus={session.status}
              linkedNumber={session.linkedNumber}
              settings={settings}
              onSendMessage={handleSendWhatsAppMessage}
              onOpenQrModal={() => setIsQrModalOpen(true)}
              onDisconnectSession={handleDisconnectWhatsAppSession}
              initialSelectedPhone={targetPhoneForWhatsApp}
            />
          )}

          {currentTab === "sms" && (
            <SmsHistoryView
              messages={messages}
              settings={settings}
              onSendSms={handleSendCarrierSms}
            />
          )}

          {currentTab === "rules" && (
            <RulesView
              rules={rules}
              templates={templates}
              onUpdateRules={setRules}
            />
          )}

          {currentTab === "templates" && (
            <TemplatesView
              templates={templates}
              settings={settings}
              onUpdateTemplates={setTemplates}
            />
          )}

          {currentTab === "simulator" && (
            <SimulatorView
              customers={customers}
              rules={rules}
              templates={templates}
              settings={settings}
              calls={calls}
              onCallProcessed={handleSimulatorCallProcessed}
            />
          )}

          {currentTab === "webhooks" && (
            <WebhooksView
              webhooks={webhooks}
              settings={settings}
              onUpdateSettings={setSettings}
              onSendTestWebhook={handleSendTestWebhook}
            />
          )}

          {currentTab === "settings" && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
            />
          )}

          {currentTab === "download" && (
            <DownloadView onBackToDashboard={() => setCurrentTab("dashboard")} />
          )}
        </main>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={handleUpdateCustomer}
          onSendMessage={(phone, name) => {
            setSelectedCustomer(null);
            handleOpenMessageForPhone(phone, name);
          }}
        />
      )}

      {/* Subscription Paywall Modal */}
      {isPaywallOpen && (
        <AuthPaywallModal
          user={user}
          onClose={() => setIsPaywallOpen(false)}
          onUpdateUser={setUser}
        />
      )}

      {/* QR Code Device Link Modal */}
      <QrCodeScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onConnect={handleConnectWhatsAppSession}
      />
    </div>
  );
}
