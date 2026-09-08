import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Missed Call to WhatsApp',
  description: 'Privacy Policy for the MissCall Assistant application.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate prose-green">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Introduction</h2>
        <p>
          MissCall Assistant ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our Android application handles your data, particularly regarding phone calls, SMS, and contacts.
        </p>

        <h2>2. Data Collection and Local Storage</h2>
        <p>
          Unlike many cloud-based CRM systems, <strong>MissCall Assistant operates primarily offline on your device</strong>. The following data is processed and stored <em>locally</em> on your device's encrypted storage (via Room SQLite):
        </p>
        <ul>
          <li><strong>Call Logs:</strong> The app monitors incoming calls to detect missed calls. It extracts the phone number and timestamp.</li>
          <li><strong>Contacts:</strong> The app reads contact names associated with the missed call numbers to display them in the CRM.</li>
          <li><strong>Message Content:</strong> The text of the SMS or WhatsApp messages you draft or send via the app.</li>
        </ul>
        <p>We do not upload your call logs, contact lists, or messages to our own servers.</p>

        <h2>3. Third-Party Integrations and Network Requests</h2>
        <p>
          Data is only transmitted over the internet under the specific scenarios you configure:
        </p>
        <ul>
          <li><strong>WhatsApp Cloud API:</strong> If you configure the official Cloud API, messages and recipient phone numbers are sent directly to Meta's servers.</li>
          <li><strong>Webhooks:</strong> If you configure custom Webhooks, JSON payloads containing call events and customer phone numbers are transmitted to the external URLs you provide.</li>
        </ul>
        <p>We are not responsible for the privacy practices of Meta (WhatsApp) or any third-party webhook endpoints you configure.</p>

        <h2>4. Permissions</h2>
        <p>The Android app requires the following sensitive permissions to function:</p>
        <ul>
          <li><code>READ_CALL_LOG</code> & <code>READ_PHONE_STATE</code>: Required to detect missed calls.</li>
          <li><code>SEND_SMS</code>: Required to dispatch automated text messages from your SIM card.</li>
          <li><code>READ_CONTACTS</code>: Required to resolve caller names.</li>
        </ul>

        <h2>5. Analytics</h2>
        <p>
          We do not use Firebase Analytics or third-party tracking SDKs to harvest personal data from the app.
        </p>

        <h2>6. Changes to this Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@misscallassistant.com.
        </p>
      </div>
    </div>
  );
}
