import { BusinessSettings, CallEvent, Customer, MessageRecord, MessageTemplate, WhatsAppConnectionStatus } from "@/types";

class LocalFirstStore {
  private settings: BusinessSettings = {
    businessName: "Apex Electronics",
    ownerName: "John Sharma",
    defaultCountryCode: "91",
    isAutoReplyEnabled: false,
    autoReplyDelayMinutes: 1,
    workingHoursEnabled: true,
    workingHoursStart: "09:00",
    workingHoursEnd: "19:00",
    whatsAppSendingMode: "WHATSAPP_WEB",
    whatsAppWebConnectedNumber: "+91 98765 43210",
  };

  private connectionStatus: WhatsAppConnectionStatus = "CONNECTED";

  private templates: MessageTemplate[] = [
    {
      id: "tmpl_1",
      name: "Template 1 (Default)",
      content: "Hi {{name}}, we noticed that you called {{business_name}}. Sorry we missed your call. How can we help you?",
      isDefault: true,
      language: "en",
    },
    {
      id: "tmpl_2",
      name: "Template 2 (Quick Assistance)",
      content: "Hi! Sorry we missed your call. Please reply here with what you need and our team will get back to you shortly.",
      isDefault: false,
      language: "en",
    },
    {
      id: "tmpl_3",
      name: "Template 3 (Contact & Follow-up)",
      content: "Hello {{name}}, thanks for contacting {{business_name}}. We missed your call. You can message us here and we'll assist you.",
      isDefault: false,
      language: "en",
    },
  ];

  private customers: Customer[] = [
    {
      id: "cust_1",
      phoneNumber: "+91 98765 12345",
      name: "Rahul Verma",
      company: "TechCorp India",
      totalMissedCalls: 3,
      lastCallTimestamp: Date.now() - 15 * 60 * 1000,
      isVip: true,
      isBlacklisted: false,
      notes: "Interested in bulk inverter battery inquiry.",
    },
    {
      id: "cust_2",
      phoneNumber: "+91 98111 22334",
      name: "Pooja Patel",
      company: "Self-Employed",
      totalMissedCalls: 1,
      lastCallTimestamp: Date.now() - 45 * 60 * 1000,
      isVip: false,
      isBlacklisted: false,
      notes: "Warranty service query.",
    },
    {
      id: "cust_3",
      phoneNumber: "+91 99887 76655",
      name: "Amit Kumar",
      company: "Kumar & Sons",
      totalMissedCalls: 2,
      lastCallTimestamp: Date.now() - 120 * 60 * 1000,
      isVip: false,
      isBlacklisted: false,
      notes: "Repair status check.",
    },
    {
      id: "cust_4",
      phoneNumber: "+91 91234 56789",
      name: "Unknown Caller",
      totalMissedCalls: 1,
      lastCallTimestamp: Date.now() - 180 * 60 * 1000,
      isVip: false,
      isBlacklisted: false,
      notes: "First time caller.",
    },
  ];

  private calls: CallEvent[] = [
    {
      id: "call_1",
      phoneNumber: "+91 98765 12345",
      customerName: "Rahul Verma",
      timestamp: Date.now() - 15 * 60 * 1000,
      status: "MISSED",
      whatsappStatus: "PENDING",
      suggestedMessage: "Hi Rahul Verma, we noticed that you called Apex Electronics. Sorry we missed your call. How can we help you?",
    },
    {
      id: "call_2",
      phoneNumber: "+91 98111 22334",
      customerName: "Pooja Patel",
      timestamp: Date.now() - 45 * 60 * 1000,
      status: "MISSED",
      whatsappStatus: "SENT",
      suggestedMessage: "Hi Pooja Patel, we noticed that you called Apex Electronics. Sorry we missed your call. How can we help you?",
    },
    {
      id: "call_3",
      phoneNumber: "+91 99887 76655",
      customerName: "Amit Kumar",
      timestamp: Date.now() - 120 * 60 * 1000,
      status: "MISSED",
      whatsappStatus: "PENDING",
      suggestedMessage: "Hi Amit Kumar, we noticed that you called Apex Electronics. Sorry we missed your call. How can we help you?",
    },
    {
      id: "call_4",
      phoneNumber: "+91 91234 56789",
      timestamp: Date.now() - 180 * 60 * 1000,
      status: "MISSED",
      whatsappStatus: "PENDING",
      suggestedMessage: "Hi! we noticed that you called Apex Electronics. Sorry we missed your call. How can we help you?",
    },
  ];

  private messages: MessageRecord[] = [
    {
      id: "msg_1",
      callEventId: "call_2",
      customerId: "cust_2",
      phoneNumber: "+91 98111 22334",
      customerName: "Pooja Patel",
      content: "Hi Pooja Patel, we noticed that you called Apex Electronics. Sorry we missed your call. How can we help you?",
      timestamp: Date.now() - 40 * 60 * 1000,
      status: "DELIVERED",
      mode: "WHATSAPP_WEB",
    },
  ];

  // Getters & Mutators
  getSettings(): BusinessSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<BusinessSettings>): BusinessSettings {
    this.settings = { ...this.settings, ...newSettings };
    return this.getSettings();
  }

  getConnectionStatus(): { status: WhatsAppConnectionStatus; number?: string } {
    return {
      status: this.connectionStatus,
      number: this.settings.whatsAppWebConnectedNumber,
    };
  }

  setConnectionStatus(status: WhatsAppConnectionStatus, number?: string) {
    this.connectionStatus = status;
    if (number !== undefined) {
      this.settings.whatsAppWebConnectedNumber = number;
    }
  }

  getTemplates(): MessageTemplate[] {
    return [...this.templates];
  }

  saveTemplate(template: Omit<MessageTemplate, "id"> & { id?: string }): MessageTemplate {
    if (template.isDefault) {
      this.templates.forEach((t) => (t.isDefault = false));
    }
    if (template.id) {
      const idx = this.templates.findIndex((t) => t.id === template.id);
      if (idx >= 0) {
        this.templates[idx] = { ...this.templates[idx], ...template } as MessageTemplate;
        return this.templates[idx];
      }
    }
    const newTemplate: MessageTemplate = {
      ...template,
      id: `tmpl_${Date.now()}`,
      language: template.language || "en",
      isDefault: template.isDefault ?? false,
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  deleteTemplate(id: string): boolean {
    const prevLen = this.templates.length;
    this.templates = this.templates.filter((t) => t.id !== id);
    return this.templates.length < prevLen;
  }

  getCalls(): CallEvent[] {
    return [...this.calls].sort((a, b) => b.timestamp - a.timestamp);
  }

  addCall(call: Omit<CallEvent, "id">): CallEvent {
    const newCall: CallEvent = { ...call, id: `call_${Date.now()}` };
    this.calls.unshift(newCall);
    return newCall;
  }

  updateCallStatus(id: string, whatsappStatus: CallEvent["whatsappStatus"]) {
    const call = this.calls.find((c) => c.id === id);
    if (call) {
      call.whatsappStatus = whatsappStatus;
    }
  }

  getCustomers(): Customer[] {
    return [...this.customers].sort((a, b) => b.lastCallTimestamp - a.lastCallTimestamp);
  }

  saveCustomer(customer: Omit<Customer, "id"> & { id?: string }): Customer {
    if (customer.id) {
      const idx = this.customers.findIndex((c) => c.id === customer.id);
      if (idx >= 0) {
        this.customers[idx] = { ...this.customers[idx], ...customer } as Customer;
        return this.customers[idx];
      }
    }
    const newCust: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
    };
    this.customers.push(newCust);
    return newCust;
  }

  getMessages(): MessageRecord[] {
    return [...this.messages].sort((a, b) => b.timestamp - a.timestamp);
  }

  addMessage(msg: Omit<MessageRecord, "id" | "timestamp">): MessageRecord {
    const newMsg: MessageRecord = {
      ...msg,
      id: `msg_${Date.now()}`,
      timestamp: Date.now(),
    };
    this.messages.unshift(newMsg);
    return newMsg;
  }

  updateMessageStatus(id: string, status: MessageRecord["status"]) {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) {
      msg.status = status;
    }
  }
}

// Global Singleton Store across API routes in dev
const globalStore = global as unknown as { __store?: LocalFirstStore };
export const store = globalStore.__store || (globalStore.__store = new LocalFirstStore());
