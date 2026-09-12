# Implementation Plan: SaaS Paywall & Subscription System

The goal is to transform the offline Android application into a subscription-based SaaS product. Users will be required to sign up and purchase a Razorpay subscription before accessing the app's core CRM functionalities. 

## 1. Architecture & Stack Decisions

To keep costs low, maintain full ownership of data, and avoid vendor lock-in (like Firebase or Clerk), we will use your existing **Fastify + PostgreSQL** backend. Both the database and backend will be deployed on **Railway**.

*   **Database:** PostgreSQL (Hosted on Railway).
*   **Authentication:** Custom Email/Password with JWT and bcrypt (Built into the Fastify backend).
*   **Payment Gateway:** Razorpay Subscriptions & Webhooks.
*   **Android App:** Retrofit for API calls, EncryptedSharedPreferences for secure JWT storage, and Jetpack Compose for Auth/Paywall screens.

## 2. Phase 1: Backend Infrastructure (Fastify + PostgreSQL)

*   [NEW] Create database tables for `users` (email, password_hash, subscription_status, subscription_id, razorpay_customer_id).
*   [NEW] Implement `/api/auth/register` and `/api/auth/login` routes returning JWT tokens.
*   [NEW] Implement `/api/users/me` to fetch the current user's subscription status.
*   [NEW] Implement `/api/webhooks/razorpay` to listen for Razorpay events:
    *   `subscription.charged`: Updates user's `subscription_status` to `ACTIVE`.
    *   `subscription.halted` / `subscription.cancelled`: Updates user's `subscription_status` to `INACTIVE`.

## 3. Phase 2: Android App Authentication & Paywall

*   [MODIFY] Add Retrofit dependencies to `build.gradle.kts`.
*   [NEW] Create `AuthRepository` and `AuthViewModel` to handle login/registration API calls.
*   [NEW] Build `LoginScreen` and `RegisterScreen` in Jetpack Compose.
*   [NEW] Build `PaywallScreen` in Jetpack Compose:
    *   Displays when a logged-in user has an `INACTIVE` subscription.
    *   Contains a button that opens the Razorpay Subscription Link (`https://rzp.io/rzp/DCET6eO8`) in a Chrome Custom Tab.
    *   Contains a "I have completed payment" button that polls `/api/users/me` to check if the backend received the webhook.
*   [MODIFY] Update the App's Main Navigation (`AppNavHost.kt`) to enforce the Auth -> Paywall -> Dashboard flow.

## 4. Phase 3: Deployment & Admin Dashboard (Future)

*   Deploy the Node.js backend to Railway.
*   Provision a PostgreSQL database on Railway.
*   Add an `/admin` route to the Next.js `web-dashboard` for the owner to view registered users and their subscription statuses.

## User Review Required

> [!IMPORTANT]
> **Razorpay API Keys:** Once the backend is built, you will need to provide your Razorpay Webhook Secret and set up the Webhook URL in your Razorpay Dashboard so the backend can listen to payments. I will guide you through this when we reach that step.

> [!NOTE]
> Please approve this plan so I can begin writing the Backend Authentication and Webhook code immediately!
