# Stripe Webhook Configuration

Use this guide to configure Stripe webhooks for this project.

## Webhook Endpoint URL
- URL: `https://<your-domain>/api/stripe/webhook`
  - For local, if you expose your app via a tunnel (e.g., Stripe CLI or ngrok), the path is `/api/stripe/webhook`.

Source: apps\remix\app\routes\api+\stripe.webhook.ts

## Events to Enable in Stripe
Enable only the following events (these are the only ones handled by the code):
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Notes from code:
- The handler intentionally dropped handling of `invoice.payment_succeeded`, `invoice.payment_failed`, and `checkout.session.completed`.

Source: packages\ee\server-only\stripe\webhook\handler.ts

## Signing Secret (Required in Production)
Set one of the following environment variables (first found is used):
1. `NEXT_PRIVATE_STRIPE_WEBHOOK_SECRET` (preferred)
2. `STRIPE_WEBHOOK_SECRET`
3. `STRIPE_WEBHOOK_SIGNING_SECRET`

Behavior:
- In production, a webhook secret is REQUIRED; requests without a valid signature are rejected.
- In non‑production, if no secret is set, the handler accepts unsigned events (useful for local testing).

See: .env.example under [[STRIPE]]

## Stripe API Keys
- Server-side secret key: `NEXT_PRIVATE_STRIPE_API_KEY` (required)
- (Optional) Client publishable key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Local Testing Tips
- Use the Stripe CLI to forward webhooks to your local app:
  - `stripe listen --forward-to http://localhost:3000/api/stripe/webhook`
  - Copy the webhook signing secret from the CLI output and set it as `NEXT_PRIVATE_STRIPE_WEBHOOK_SECRET`.

## Troubleshooting
- If subscriptions are created in Stripe but not reflected locally, ensure:
  - The webhook is pointing to the correct URL and reachable from Stripe.
  - The three events above are enabled.
  - The webhook signing secret matches your environment variable.
  - Billing is enabled in your environment.
