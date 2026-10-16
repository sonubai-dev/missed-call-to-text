import React, { useState } from 'react';
import { X, CreditCard, CheckCircle, Zap, RefreshCw, Lock, ExternalLink } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthPaywallModalProps {
  user: UserAccount;
  onClose: () => void;
  onUpdateUser: (user: UserAccount) => void;
}

export function AuthPaywallModal({
  user,
  onClose,
  onUpdateUser,
}: AuthPaywallModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const updated: UserAccount = {
        ...user,
        subscriptionStatus: 'ACTIVE',
        planName: 'Pro Business Plan (Unlimited)',
        subscriptionId: `sub_rzp_${Math.random().toString(36).substring(2, 10)}`,
        razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 12)}`,
      };
      onUpdateUser(updated);
      setSuccessMessage('Payment verified! Your Pro Subscription is now ACTIVE.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 1200);
  };

  const handleCancelSubscription = () => {
    const updated: UserAccount = {
      ...user,
      subscriptionStatus: 'INACTIVE',
      planName: 'Free Trial (Expired)',
    };
    onUpdateUser(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#111B21] border border-[#222E35] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#E9EDEF]">
        <div className="p-5 border-b border-[#222E35] flex items-center justify-between bg-gradient-to-r from-[#182229] to-[#111B21]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                SaaS Subscription & Account
              </h2>
              <p className="text-[11px] text-slate-400">
                Razorpay billing integration (₹100/mo) & backend sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202C33] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-[#202C33]/70 border border-[#222E35] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase font-bold tracking-wider text-[11px]">
                Current Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                  user.subscriptionStatus === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {user.subscriptionStatus === 'ACTIVE' ? 'Active • ₹100/mo' : 'Payment Required'}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">{user.planName}</div>
            <div className="text-slate-400 text-[11px]">Account Owner: {user.email}</div>
          </div>

          <div className="space-y-3">
            {user.subscriptionStatus === 'ACTIVE' ? (
              <button
                onClick={handleCancelSubscription}
                className="w-full px-4 py-2.5 rounded-xl bg-[#202C33] hover:bg-rose-500/10 text-rose-400 border border-[#222E35] hover:border-rose-500/30 font-semibold transition-all"
              >
                Simulate Expired Plan (Test Paywall)
              </button>
            ) : (
              <div className="space-y-3">
                <a
                  href="https://rzp.io/rzp/DCET6eO8"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Official Razorpay Link (₹100/mo)</span>
                </a>

                <button
                  onClick={handleSimulatePayment}
                  disabled={isVerifying}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#202C33] hover:bg-[#2A3942] text-emerald-400 font-semibold transition-all border border-[#222E35]"
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
