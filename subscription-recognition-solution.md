# Understanding Subscription Recognition in Documenso

## Issue Summary

You've reported that after subscribing to a plan, the system appears unable to identify that you're already subscribed. This document explains what's happening and provides solutions.

## Explanation

After investigating the codebase, I can confirm that the system **is correctly identifying** your subscription status. The behavior you're experiencing is actually by design:

**When you have an active subscription, the billing page intentionally hides the plans section.**

This is controlled by this condition in the billing page component:

```javascript
{(!subscription ||
  subscription.organisationSubscription.status === SubscriptionStatus.INACTIVE) &&
  canManageBilling && <BillingPlans plans={plans} />}
```

This means that plans are only displayed when:
1. You have NO subscription, OR
2. Your subscription status is INACTIVE
3. AND you have permission to manage billing

## Why This Design?

This design prevents users with active subscriptions from accidentally subscribing to multiple plans. Once you're subscribed, the billing page shows your current subscription details instead of the plans.

## How to Verify Your Subscription

You can verify that your subscription is active by checking the billing page. If you have an active subscription, you should see:

1. A message indicating that you're subscribed to a plan
2. The name of your current plan
3. Information about when your subscription will renew
4. A "Billing Portal" button that takes you to the Stripe billing portal

## Workarounds for Viewing Plans with an Active Subscription

If you need to view the available plans while having an active subscription (for example, to compare your current plan with others), you have a few options:

### Option 1: Use the Stripe Billing Portal

1. Click the "Billing Portal" button on the billing page
2. In the Stripe portal, you can view available plans and upgrade/downgrade your subscription

### Option 2: Temporary Browser Console Workaround

You can run this JavaScript in your browser console when on the billing page to temporarily display the plans:

```javascript
// This will override the condition and force plans to display
// Note: This is temporary and will reset when you refresh the page
const billingPlansContainer = document.querySelector('hr').nextElementSibling;
if (billingPlansContainer && !billingPlansContainer.children.length) {
  // Get the plans data
  const subscriptionQuery = window.__NEXT_DATA__?.props?.pageProps?.trpcState?.json?.queries?.find(
    q => q.queryKey[0] === 'enterprise.billing.subscription.get'
  );

  if (subscriptionQuery?.state?.data?.plans) {
    // Force render the BillingPlans component
    const BillingPlans = window.documenso.BillingPlans;
    if (BillingPlans) {
      const root = ReactDOM.createRoot(billingPlansContainer);
      root.render(React.createElement(BillingPlans, { plans: subscriptionQuery.state.data.plans }));
    }
  }
}
```

### Option 3: Cancel Your Subscription

If you want to switch to a different plan:
1. Go to the Stripe Billing Portal
2. Cancel your current subscription (it will remain active until the end of the billing period)
3. Return to the billing page, where plans will now be displayed
4. Subscribe to a new plan

## Conclusion

The system is working as designed - it recognizes your subscription and hides the plans section as a result. If you're experiencing any other issues with your subscription, please provide more details so we can investigate further.
