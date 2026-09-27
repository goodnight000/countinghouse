# Connectors

A connector runs in live mode when its env var is set. If a live call fails (bad key, HTTP error, 15s timeout, missing CLI), the connector keeps serving mock data, sets `status: "error"`, and logs `[sync <id>] live pull failed, serving mock data: <reason>`. The same reason appears in the `sync_integrations` MCP tool output.

| Provider | Env vars | Endpoints called | Fields mapped -> `Txn` | Verified |
|---|---|---|---|---|
| Mercury | `MERCURY_API_KEY` | `GET api.mercury.com/api/v1/accounts`; `GET /api/v1/account/{id}/transactions?limit=500&offset=&start=` | `postedAt`/`createdAt` -> date, `amount`, `bankDescription`/`counterpartyName` -> description, `attachments` -> receipt, `currentBalance` -> checking/treasury balances | No (written against the docs) |
| Stripe | `STRIPE_API_KEY` | `GET api.stripe.com/v1/balance_transactions?created[gte]=&starting_after=&expand[]=data.source`; `GET /v1/balance` | `charge`/`payment` -> Revenue, `refund` -> negative revenue, `fee` -> "STRIPE PROCESSING FEES" (Bank Fees); payouts skipped because the bank feed carries them as Transfers | 401 path verified (smoke.ts, bad key -> error + mock) |
| Brex | `BREX_API_KEY` | `GET platform.brexapis.com/v2/transactions/card/primary?posted_at_start=&cursor=` | `posted_at_date`, `amount.amount` (cents, negated), `description` / `merchant.raw_descriptor` | No |
| Ramp | `RAMP_API_KEY` (OAuth access token) | `GET api.ramp.com/developer/v1/transactions?from_date=&page_size=100` (follows `page.next`) | `user_transaction_time`, `amount` (negated), `merchant_descriptor`/`merchant_name`, `receipts` -> receipt | No |
| Gusto | `GUSTO_API_KEY`, `GUSTO_COMPANY_ID` | `GET api.gusto.com/v1/companies/{id}/payrolls?processing_statuses=processed&start_date=` | `check_date`; `totals.net_pay` -> "GUSTO NET" (Payroll); `employee_taxes + employer_taxes` -> "GUSTO TAX" (Payroll Taxes) | No |
| AWS | `AWS_ACCESS_KEY_ID` (+ the usual AWS CLI creds) | `aws ce get-cost-and-usage --granularity MONTHLY --metrics UnblendedCost` (CLI handles SigV4) | one txn per month: `UnblendedCost` -> amount, "AMAZON WEB SERVICES" descriptor | No |
| Carta | `CARTA_API_KEY`, `CARTA_ISSUER_ID` | `GET api.carta.com/v1alpha1/issuers/{id}/capitalizationTable` | raw payload stored; the franchise tax still uses the seeded share counts | No |
