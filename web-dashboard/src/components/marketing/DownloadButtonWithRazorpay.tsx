'use client';

import { CreditCard, Info } from 'lucide-react';
import Link from 'next/link';

export function DownloadButtonWithRazorpay() {
  // User's provided Razorpay Subscription Link
  const razorpayLink = 'https://rzp.io/rzp/DCET6eO8';

  return (
    <div className="flex flex-col items-center sm:items-end gap-2 w-full">
      <Link
        href={razorpayLink}
        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
      >
        <CreditCard className="mr-2 h-5 w-5" />
        Pay & Download APK
      </Link>

      <span className="text-xs text-slate-500 mt-2 max-w-sm text-center sm:text-right">
        Clicking this will take you to our secure Razorpay subscription page. Once your payment is successful, the app will download automatically.
      </span>
      
      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mt-4 text-xs text-blue-800 text-left w-full">
        <strong className="flex items-center gap-1 mb-1"><Info className="w-4 h-4"/> Admin Note for Setup:</strong>
        To make the automatic download work after payment, you must go to your <strong>Razorpay Dashboard</strong>, edit this Payment Page/Link, and set the <strong>Redirect URL</strong> to:<br/>
        <code className="bg-white px-1 py-0.5 rounded border border-blue-200 mt-1 inline-block break-all select-all">
          https://web-dashboard-eight-mu.vercel.app/downloads/misscall-assistant.apk
        </code>
      </div>
    </div>
  );
}
