import React, { useState, useEffect } from "react";
import { WebsiteView } from "./screens/WebsiteView";
import { AdminLoginView } from "./screens/AdminLoginView";
import { AdminDashboardView } from "./screens/AdminDashboardView";
import { NavTab } from "./components/Sidebar";

export default function App() {
  const [adminUser, setAdminUser] = useState<{ email: string; role: string } | null>(null);

  // Navigation State: only Website or Admin Portal
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const viewParam = search.get("view") || search.get("tab");
      if (viewParam === "admin-login") return "admin-login";
      if (viewParam === "admin" || viewParam === "admin-dashboard") return "admin-dashboard";

      const path = window.location.pathname;
      if (path === "/admin/login" || path.startsWith("/admin/login")) return "admin-login";
      if (path === "/admin" || path.startsWith("/admin")) return "admin-dashboard";
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

  // 3. Public User Website (Clean Landing Page & Direct APK Download)
  return (
    <WebsiteView
      onOpenDashboard={() => {
        setCurrentTab("admin-login");
        window.history.pushState({}, "", "/admin/login");
      }}
      onOpenSimulator={() => {
        setCurrentTab("website");
      }}
      onNavigateTab={(tab: NavTab) => {
        if (tab === "admin-login") {
          setCurrentTab("admin-login");
          window.history.pushState({}, "", "/admin/login");
        } else if (tab === "admin-dashboard") {
          setCurrentTab("admin-dashboard");
          window.history.pushState({}, "", "/admin");
        } else {
          setCurrentTab("website");
          window.history.pushState({}, "", "/");
        }
      }}
    />
  );
}
