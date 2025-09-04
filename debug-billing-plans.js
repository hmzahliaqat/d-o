// Debug script to identify why plans are not displaying in the billing section
// Run this in your browser console when on the billing page

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

  // Check if user can manage billing
  // This requires accessing the React component state, which is more complex
  console.log('To check if you can manage billing, look for "canManageBilling" variable in the component');

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
