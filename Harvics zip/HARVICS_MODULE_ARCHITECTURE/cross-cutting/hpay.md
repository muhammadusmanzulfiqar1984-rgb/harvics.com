# HPay Integration Architecture

HPay is the programmable financial and settlement layer of Harvics.

It is not a bank.

## V1 P0

- Identity/Auth
- KYC/KYB
- Accounts/Wallets
- Double-entry Ledger
- Payments
- Payment Methods
- Merchant Onboarding
- Checkout
- Payouts
- Refunds
- Admin
- Webhooks

## V1 P1

- Settlement
- Risk Engine

## V1 P2

- Harvey read-only financial queries

## HPay internal modules

```text
auth
users
businesses
accounts
ledger
payments
payment-methods
payouts
settlements
refunds
risk
compliance
merchants
invoices
webhooks
notifications
admin
```

## Financial rules

- PostgreSQL 15+
- BIGINT smallest currency unit
- UTC timestamps
- UUID identifiers
- ISO 4217 currency codes
- immutable double-entry ledger
- idempotency
- reconciliation

Provider adapters must sit behind a provider interface.

Source-specific provider options include Stripe, Checkout.com and local PSP adapters; final provider choice is a deployment decision, not an architectural assumption.
