# Why Plans Are Not Displaying in the Billing Section

Based on my analysis of the codebase, I've identified the reasons why plans might be visible in the API response but not displaying in the UI.

## Conditions for Plans to Display

Plans will only display in the billing section when **ALL** of these conditions are met:

1. **Subscription Status**:
   - You have NO subscription OR
   - Your subscription status is INACTIVE

2. **User Permissions**:
   - You have permission to manage billing (canManageBilling = true)

3. **Plan Metadata**:
   - Each Stripe product must have a `claimId` metadata field matching one of the valid INTERNAL_CLAIM_ID values:
     - free
     - individual
     - team
     - earlyAdopter
     - platform
     - enterprise

4. **Price Metadata**:
   - Each Stripe price must have a `visibleInApp` metadata field set to the string value `'true'`

## How to Debug the Issue

I've created a debugging script (`debug-billing-plans.js`) that you can run in your browser console when on the billing page. This script will help identify which condition is preventing plans from displaying.

```javascript
// Copy and paste this into your browser console when on the billing page
// Then press Enter to run it
(function debugBillingPlans() {
  // Get the subscription data from the API response
  const subscriptionQuery = window.__NEXT_DATA__?.props?.pageProps?.trpcState?.json?.queries?.find(
    q => q.queryKey[0] === 'enterprise.billing.subscription.get'
  );

  if (!subscriptionQuery) {
    console.error('Could not find subscription query data');
    return;
  }

  const data = subscriptionQuery.state.data;

  console.log('=== BILLING PLANS DEBUG ===');

  // Check if user has an active subscription
  const subscription = data.subscription;
  if (subscription) {
    console.log('Subscription exists:', {
      status: subscription.organisationSubscription.status,
      isActive: subscription.organisationSubscription.status === 'ACTIVE',
    });

    if (subscription.organisationSubscription.status === 'ACTIVE') {
      console.log('ISSUE FOUND: Plans are not displayed because you have an active subscription');
    }
  } else {
    console.log('No subscription found');
  }

  // Check if plans have the required metadata
  const plans = data.plans;
  const plansWithMetadata = {};

  Object.entries(plans).forEach(([claimId, plan]) => {
    const monthlyVisible = plan.monthlyPrice?.isVisibleInApp;
    const yearlyVisible = plan.yearlyPrice?.isVisibleInApp;

    plansWithMetadata[claimId] = {
      hasMonthlyPrice: !!plan.monthlyPrice,
      hasYearlyPrice: !!plan.yearlyPrice,
      monthlyVisibleInApp: monthlyVisible,
      yearlyVisibleInApp: yearlyVisible,
    };
  });

  console.log('Plans metadata:', plansWithMetadata);

  const anyVisiblePlans = Object.values(plansWithMetadata).some(
    plan => (plan.hasMonthlyPrice && plan.monthlyVisibleInApp) || (plan.hasYearlyPrice && plan.yearlyVisibleInApp)
  );

  if (!anyVisiblePlans) {
    console.log('ISSUE FOUND: None of your plans have prices with visibleInApp=true metadata');
  }

  console.log('=== END DEBUG ===');

  return {
    hasActiveSubscription: subscription?.organisationSubscription.status === 'ACTIVE',
    plansWithMetadata,
    anyVisiblePlans,
  };
})();
```

## Solutions Based on the Issue

### If you have an active subscription

Plans are not displayed by design when you have an active subscription. This is controlled by this condition in the billing page component:

```javascript
{(!subscription ||
  subscription.organisationSubscription.status === SubscriptionStatus.INACTIVE) &&
  canManageBilling && <BillingPlans plans={plans} />}
```

**Solution**: If you need to see plans while having an active subscription, you have two options:
1. Cancel your subscription (it will remain active until the end of the billing period)
2. Modify the code to display plans even with an active subscription

### If you don't have permission to manage billing

**Solution**: Ensure your user account has the appropriate role with the 'MANAGE_BILLING' permission.

### If your plans don't have the correct metadata

**Solution**: Update your Stripe configuration:

1. **For Products**:
   - Add or update the `claimId` metadata field with one of the valid values (free, individual, team, earlyAdopter, platform, enterprise)

2. **For Prices**:
   - Add or update the `visibleInApp` metadata field to `true` (as a string)

You can update these through the Stripe Dashboard:
1. Go to Products in your Stripe Dashboard
2. Select a product
3. Scroll down to "Metadata"
4. Add or update the required fields

## Temporary Workaround

If you want to temporarily modify the code to display plans regardless of subscription status, you can run this in your browser console:

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

Note that this workaround may not work in all cases and is just for debugging purposes.
