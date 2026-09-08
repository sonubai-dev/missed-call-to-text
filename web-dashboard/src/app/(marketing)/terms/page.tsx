import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Missed Call to WhatsApp',
  description: 'Terms of Service for the MissCall Assistant application.',
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate prose-green">
        <h1>Terms of Service</h1>
        <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>
          By downloading, installing, or using the MissCall Assistant Android application ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.
        </p>

        <h2>2. Use of the App</h2>
        <p>
          The App is designed to help businesses automate follow-up communications. You agree to use the App in compliance with all applicable local, state, national, and international laws, rules, and regulations.
        </p>

        <h2>3. Messaging Responsibility and Anti-Spam</h2>
        <p>
          You are solely responsible for the content of the messages sent through the App. You agree <strong>not</strong> to use the App to send spam, unsolicited promotional material, or any content that violates the law. Standard SMS rates from your cellular provider apply to native SMS messages. We are not responsible for any carrier charges incurred.
        </p>

        <h2>4. WhatsApp Integration</h2>
        <p>
          If you utilize the WhatsApp Web Adapter or WhatsApp Cloud API integrations, you agree to comply with Meta's WhatsApp Terms of Service and Business Policies. You acknowledge that unauthorized use of WhatsApp automation may result in your WhatsApp account being banned by Meta. We are not responsible for any account suspensions.
        </p>

        <h2>5. Disclaimer of Warranties</h2>
        <p>
          The App is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not warrant that the App will be uninterrupted, error-free, or completely secure. We do not guarantee the successful delivery of any SMS, WhatsApp message, or Webhook payload.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of the App.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All rights, title, and interest in and to the App and its components are and will remain the exclusive property of the developers.
        </p>

        <h2>8. Contact</h2>
        <p>
          If you have any questions regarding these Terms, please contact us at legal@misscallassistant.com.
        </p>
      </div>
    </div>
  );
}
