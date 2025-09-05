import { match } from 'ts-pattern';

import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import type { Stripe } from '@documenso/lib/server-only/stripe';
import { stripe } from '@documenso/lib/server-only/stripe';
import { env } from '@documenso/lib/utils/env';

import { onSubscriptionCreated } from './on-subscription-created';
import { onSubscriptionDeleted } from './on-subscription-deleted';
import { onSubscriptionUpdated } from './on-subscription-updated';

type StripeWebhookResponse = {
  success: boolean;
  message: string;
};

export const stripeWebhookHandler = async (req: Request): Promise<Response> => {
  try {
    const isBillingEnabled = IS_BILLING_ENABLED();

    if (!isBillingEnabled) {
      return Response.json(
        {
          success: false,
          message: 'Billing is disabled',
        } satisfies StripeWebhookResponse,
        { status: 500 },
      );
    }

    const primarySecret = env('NEXT_PRIVATE_STRIPE_WEBHOOK_SECRET');
    const altSecret = env('STRIPE_WEBHOOK_SECRET') ?? env('STRIPE_WEBHOOK_SIGNING_SECRET');
    const webhookSecret = primarySecret ?? altSecret;

    const signature =
      typeof req.headers.get('stripe-signature') === 'string'
        ? req.headers.get('stripe-signature')
        : '';

    const payload = await req.text();

    if (!payload) {
      return Response.json(
        {
          success: false,
          message: 'No payload found in request',
        } satisfies StripeWebhookResponse,
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    if (webhookSecret) {
      if (!signature) {
        return Response.json(
          {
            success: false,
            message: 'No signature found in request',
          } satisfies StripeWebhookResponse,
          { status: 400 },
        );
      }

      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } else {
      // In development, allow unsigned events to help local testing when webhook secret isn't configured.
      if (env('NODE_ENV') === 'production') {
        return Response.json(
          {
            success: false,
            message:
              'Missing Stripe webhook secret. Set NEXT_PRIVATE_STRIPE_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET) in your environment.',
          } satisfies StripeWebhookResponse,
          { status: 500 },
        );
      }

      try {
        event = JSON.parse(payload);
        // eslint-disable-next-line no-console
        console.warn(
          '[Stripe Webhook] Using unsigned webhook event in non-production environment. Configure NEXT_PRIVATE_STRIPE_WEBHOOK_SECRET to enable signature verification.',
        );
      } catch {
        return Response.json(
          { success: false, message: 'Invalid JSON payload' } satisfies StripeWebhookResponse,
          { status: 400 },
        );
      }
    }

    /**
     * Notes:
     * - Dropped invoice.payment_succeeded
     * - Dropped invoice.payment_failed
     * - Dropped checkout-session.completed
     */
    return await match(event.type)
      .with('customer.subscription.created', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const subscription = event.data.object as Stripe.Subscription;

        await onSubscriptionCreated({ subscription });

        return Response.json(
          { success: true, message: 'Webhook received' } satisfies StripeWebhookResponse,
          { status: 200 },
        );
      })
      .with('customer.subscription.updated', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const subscription = event.data.object as Stripe.Subscription;

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const previousAttributes = event.data
          .previous_attributes as Partial<Stripe.Subscription> | null;

        await onSubscriptionUpdated({ subscription, previousAttributes });

        return Response.json(
          { success: true, message: 'Webhook received' } satisfies StripeWebhookResponse,
          { status: 200 },
        );
      })
      .with('customer.subscription.deleted', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const subscription = event.data.object as Stripe.Subscription;

        await onSubscriptionDeleted({ subscription });

        return Response.json(
          {
            success: true,
            message: 'Webhook received',
          } satisfies StripeWebhookResponse,
          { status: 200 },
        );
      })
      .otherwise(() => {
        return Response.json(
          {
            success: true,
            message: 'Webhook received',
          } satisfies StripeWebhookResponse,
          { status: 200 },
        );
      });
  } catch (err) {
    console.error(err);

    if (err instanceof Response) {
      const message = await err.json();
      console.error(message);

      return err;
    }

    const message = err instanceof Error ? err.message : 'Unknown error';

    return Response.json(
      {
        success: false,
        message,
      } satisfies StripeWebhookResponse,
      { status: 500 },
    );
  }
};
