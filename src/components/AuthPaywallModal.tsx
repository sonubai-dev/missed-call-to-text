import React, { useState } from "react";
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Zap,
  Lock,
  RefreshCw,
  User,
  KeyRound,
} from "lucide-react";
import { UserAccount } from "../types";

interface AuthPaywallModalProps {
  user: UserAccount;
  onClose: () => void;
  onUpdateUser: (user: UserAccount) => void;
}

export const AuthPaywallModal: React.FC<AuthPaywallModalProps> = ({
  user,
  onClose,
  onUpdateUser,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authMode, setAuthMode] = useState<"STATUS" | "LOGIN">("STATUS");
  const [loginEmail, setLoginEmail] = useState(user.email);
  const [loginName, setLoginName] = useState(user.name);

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const updated: UserAccount = {
        ...user,
        subscriptionStatus: "ACTIVE",
        planName: "Pro Business Plan (Unlimited Missed Calls)",
        subscriptionId: `sub_rzp_${Math.random().toString(36).substring(2, 10)}`,
        razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 12)}`,
      };
      onUpdateUser(updated);
      setSuccessMessage("Payment verified! Your Pro Subscription is now ACTIVE.");
      setTimeout(() => setSuccessMessage(""), 4000);
    }, 1200);
  };

  const handleCancelSubscription = () => {
    const updated: UserAccount = {
      ...user,
      subscriptionStatus: "INACTIVE",
      planName: "Free Trial (Expired)",
    };
    onUpdateUser(updated);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...user,
      email: loginEmail,
      name: loginName || "Business Owner",
    };
    onUpdateUser(updated);
    setAuthMode("STATUS");
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-lg bg-[#111B21] border border-[#222E35] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#222E35] flex items-center justify-between bg-gradient-to-r from-[#182229] to-[#111B21]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                SaaS Subscription & Account
              </h2>
              <p className="text-[11px] text-[#8696A0]">
                Razorpay billing integration & Fastify backend sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202C33] text-[#8696A0] hover:text-white hover:bg-[#2A3942] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {authMode === "STATUS" ? (
            <>
              {/* Current Status Box */}
              <div className="p-5 rounded-2xl bg-[#202C33]/70 border border-[#222E35] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8696A0] uppercase font-bold tracking-wider">
                    Current Plan Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                      user.subscriptionStatus === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {user.subscriptionStatus === "ACTIVE" ? "ACTIVE PRO PLAN" : "PAYMENT REQUIRED"}
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-sm font-bold text-white">{user.planName}</p>
                  <p className="text-xs text-[#8696A0] font-mono mt-0.5">
                    Account: {user.name} ({user.email})
                  </p>
                  {user.subscriptionId && (
                    <p className="text-[11px] text-[#8696A0] font-mono mt-1">
                      Subscription ID: <span className="text-teal-400">{user.subscriptionId}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Plan Perks */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Included SaaS Features
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Unlimited Missed Call Screening",
                    "WhatsApp Web Isolated Bridge",
                    "Dual-SIM Android SMS Dispatch",
                    "Local Customer CRM Timeline",
                    "Cryptographic HMAC Webhooks",
                    "AI Message Tone & Lang Engine",
                  ].map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#202C33]/40 border border-[#222E35]/40 text-xs text-gray-300"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#00A884] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-3">
                {user.subscriptionStatus === "ACTIVE" ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCancelSubscription}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#202C33] hover:bg-rose-500/10 text-rose-400 border border-[#222E35] hover:border-rose-500/30 text-xs font-semibold transition-all text-center"
                    >
                      Simulate Expired Plan (Test Paywall)
                    </button>
                    <button
                      onClick={() => setAuthMode("LOGIN")}
                      className="px-4 py-2.5 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-white text-xs font-semibold transition-all text-center"
                    >
                      Edit Account Details
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <p className="font-semibold">Razorpay Checkout Sandbox</p>
                      <p className="mt-0.5 text-gray-300">
                        In production, the Android app directs you to the Razorpay subscription link (<code>https://rzp.io/rzp/DCET6eO8</code>). Click below to simulate completing the subscription.
                      </p>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isVerifying}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/40"
                      >
                        {isVerifying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Webhook...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Simulate Successful Payment</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setAuthMode("LOGIN")}
                        className="px-4 py-3 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-white"
                      >
                        Switch User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Full Name / Business Owner
                </label>
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  required
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8696A0] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full bg-[#202C33] border border-[#222E35] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00A884]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("STATUS")}
                  className="px-4 py-2 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-xs font-semibold text-[#8696A0] hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A884] hover:bg-[#008f6f] text-xs font-bold text-white shadow-md shadow-[#00A884]/20"
                >
                  Save & Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
