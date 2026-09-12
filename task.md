# Execution Tasks

## Phase 1: Backend Infrastructure (Fastify + PostgreSQL)
- [/] Update PostgreSQL schema (`users` table with subscription fields).
- [ ] Create Database connection pool configuration.
- [ ] Implement User Repository methods (create user, find by email, update subscription).
- [ ] Implement Auth Routes (`/api/auth/register`, `/api/auth/login`).
- [ ] Implement Razorpay Webhook Route (`/api/webhooks/razorpay`).
- [ ] Implement User Routes (`/api/users/me`).
- [ ] Verify backend compilation.

## Phase 2: Android App Authentication & Paywall
- [ ] Add Retrofit & Navigation dependencies.
- [ ] Implement `AuthRepository` and `AuthViewModel`.
- [ ] Build `LoginScreen` and `RegisterScreen` in Jetpack Compose.
- [ ] Build `PaywallScreen`.
- [ ] Update `MainActivity` / Navigation Graph.
- [ ] Verify Android compilation.

## Phase 3: Web Dashboard Admin Area
- [ ] Create `/admin` layout and protection.
- [ ] Create Users list view.
- [ ] Verify Next.js build.
