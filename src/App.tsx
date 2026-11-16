import React, { useState, useEffect } from "react";
import { WebsiteView } from "./screens/WebsiteView";
import { AdminLoginView } from "./screens/AdminLoginView";
import { AdminDashboardView } from "./screens/AdminDashboardView";
import { AndroidSimulatorView } from "./screens/AndroidSimulatorView";
import { NavTab } from "./components/Sidebar";
import { Customer, MessageTemplate, BusinessSettings, CallEvent } from "./types";

export default function App() {
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);

  // App mock data for interactive simulator
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [calls, setCalls] = useState<CallEvent[]>([
    {
      id: 'call-sample-1',
      phoneNumber: '+91 98765 43210',
      customerName: 'Rahul Verma (New Lead)',
      timestamp: Date.now() - 1000 * 60 * 12,
      status: 'MISSED',
      whatsappStatus: 'SENT',
      suggestedMessage: 'Thanks for calling Solita Solutions! We are currently assisting customers. What product or size are you looking for?',
      simSlot: 'SIM 1 (Jio 5G)',
    },
    {
      id: 'call-sample-2',
      phoneNumber: '+91 94321 09876',
      customerName: 'Dr. Priya Patel (VIP Lead)',
      timestamp: Date.now() - 1000 * 60 * 45,
      status: 'MISSED',
      whatsappStatus: 'SENT',
      suggestedMessage: 'Hello from Solita Solutions! For appointment bookings or inquiries, please reply with your patient name.',
      simSlot: 'SIM 2 (Airtel 4G)',
    },
  ]);
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: 'Solita Solutions',
    businessPhone: '+91 93417 18066',
    smsDelay: 5,
    selectedSim: 'SIM 1 (Jio 5G)',
    isServiceActive: true,
  });
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: 'tmpl-1',
      name: 'Retail / Store',
      tag: '🏪 Store',
      content: 'Thanks for calling {{business_name}}! We are currently assisting in-store shoppers. What product or size are you looking for?',
      language: 'EN',
    },
    {
      id: 'tmpl-2',
      name: 'Clinic / Doctor',
      tag: '🏥 Clinic',
      content: 'Hello from {{business_name}}! For appointment bookings, clinic timings, or emergency inquiries, please reply with your patient name.',
      language: 'EN',
    },
    {
      id: 'tmpl-3',
      name: 'Repair / Services',
      tag: '🔧 Services',
      content: 'Missed your call at {{business_name}}! Please share your vehicle or appliance model and problem for quick repair assistance.',
      language: 'EN',
    },
    {
      id: 'tmpl-4',
      name: 'After-Hours / Night',
      tag: '🌙 Closed',
      content: '{{business_name}} is currently closed for the day. Our team has recorded your call and will call you back first thing tomorrow morning!',
      language: 'EN',
    },
    {
      id: 'tmpl-5',
      name: 'General Follow-up',
      tag: '💼 General',
      content: 'Hello! Sorry we missed your call from {{business_name}}. How can we assist you today?',
      language: 'EN',
    },
  ]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const viewParam = search.get("view") || search.get("tab");
      if (viewParam === "admin-login") return "admin-login";
      if (viewParam === "admin" || viewParam === "admin-dashboard") return "admin-dashboard";
      if (viewParam === "simulator" || viewParam === "android-simulator") return "simulator";

      const path = window.location.pathname;
      if (path === "/admin/login" || path.startsWith("/admin/login")) return "admin-login";
      if (path === "/admin" || path.startsWith("/admin")) return "admin-dashboard";
      if (path === "/simulator") return "simulator";
    }
    // Default: Official Android App Website & Download Page
    return "website";
  });

  // Check existing admin session on mount
  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated && data.admin) {
          setAdminUser(data.admin);
        }
      })
      .catch(() => {});
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const search = new URLSearchParams(window.location.search);
        const viewParam = search.get("view") || search.get("tab");
        if (viewParam === "admin-login" || window.location.pathname.startsWith("/admin/login")) {
          setCurrentTab("admin-login");
        } else if (viewParam === "admin" || window.location.pathname.startsWith("/admin")) {
          setCurrentTab("admin-dashboard");
        } else if (viewParam === "simulator" || window.location.pathname.startsWith("/simulator")) {
          setCurrentTab("simulator");
        } else {
          setCurrentTab("website");
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 1. Admin Login View
  if (currentTab === "admin-login") {
    return (
      <AdminLoginView
        onLoginSuccess={(admin) => {
          setAdminUser(admin);
          setCurrentTab("admin-dashboard");
          window.history.pushState({}, "", "/admin");
        }}
        onBackToSite={() => {
          setCurrentTab("website");
          window.history.pushState({}, "", "/");
        }}
      />
    );
  }

  // 2. Admin Dashboard View (Full Backend Management for the Owner)
  if (currentTab === "admin-dashboard") {
    return (
      <AdminDashboardView
        adminEmail={adminUser?.email || "ssdd747346@gmail.com"}
        onLogout={() => {
          setAdminUser(null);
          setCurrentTab("admin-login");
          window.history.pushState({}, "", "/admin/login");
        }}
        onOpenDashboard={() => {
          setCurrentTab("website");
          window.history.pushState({}, "", "/");
        }}
        onOpenWebsite={() => {
          setCurrentTab("website");
          window.history.pushState({}, "", "/");
        }}
      />
    );
  }

  // 3. Interactive Modern Android App Simulator
  if (currentTab === "simulator") {
    return (
      <div className="min-h-screen bg-[#0C1317] text-[#E9EDEF] p-4 sm:p-6 lg:p-8">
        <AndroidSimulatorView
          customers={customers}
          templates={templates}
          settings={settings}
          calls={calls}
          onCallProcessed={(newCall, existingCustomer, messageContent) => {
            setCalls((prev) => [newCall, ...prev]);
          }}
          onNavigateTab={(tab) => {
            if (tab === "website") {
              setCurrentTab("website");
              window.history.pushState({}, "", "/");
            } else if (tab === "admin-login") {
              setCurrentTab("admin-login");
              window.history.pushState({}, "", "/admin/login");
            } else {
              setCurrentTab(tab);
            }
          }}
        />
      </div>
    );
  }

  // 4. Public User Website (Clean Landing Page & Direct APK Download)
  return (
    <WebsiteView
      onOpenDashboard={() => {
        setCurrentTab("admin-login");
        window.history.pushState({}, "", "/admin/login");
      }}
      onOpenSimulator={() => {
        setCurrentTab("simulator");
        window.history.pushState({}, "", "/?view=simulator");
      }}
      onNavigateTab={(tab: NavTab) => {
        if (tab === "admin-login") {
          setCurrentTab("admin-login");
          window.history.pushState({}, "", "/admin/login");
        } else if (tab === "admin-dashboard") {
          setCurrentTab("admin-dashboard");
          window.history.pushState({}, "", "/admin");
        } else if (tab === "simulator") {
          setCurrentTab("simulator");
          window.history.pushState({}, "", "/?view=simulator");
        } else {
          setCurrentTab("website");
          window.history.pushState({}, "", "/");
        }
      }}
    />
  );
}
