// Test script to verify subscription recognition and workarounds
// Run this in your browser console when on the billing page

(function testSubscriptionRecognition() {
  console.log('=== SUBSCRIPTION RECOGNITION TEST ===');

  // Get the subscription data from the API response
  const subscriptionQuery = window.__NEXT_DATA__?.props?.pageProps?.trpcState?.json?.queries?.find(
    q => q.queryKey[0] === 'enterprise.billing.subscription.get'
  );

  if (!subscriptionQuery) {
    console.error('Could not find subscription query data');
    return;
  }

  const data = subscriptionQuery.state.data;

  // Check if user has an active subscription
  const subscription = data.subscription;
  if (subscription) {
    console.log('Subscription exists:', {
      status: subscription.organisationSubscription.status,
      isActive: subscription.organisationSubscription.status === 'ACTIVE',
      planId: subscription.organisationSubscription.planId,
      priceId: subscription.organisationSubscription.priceId,
      periodEnd: subscription.organisationSubscription.periodEnd,
    });

    // Verify that the subscription is correctly recognized
    if (subscription.organisationSubscription.status === 'ACTIVE') {
      console.log('CONFIRMED: System correctly recognizes active subscription');

      // Check if plans are hidden as expected
      const plansContainer = document.querySelector('hr').nextElementSibling;
      const plansVisible = plansContainer && plansContainer.children.length > 0;

      if (!plansVisible) {
        console.log('CONFIRMED: Plans are hidden for active subscription (expected behavior)');
      } else {
        console.warn('UNEXPECTED: Plans are visible despite active subscription');
      }

      // Test workaround for displaying plans
      console.log('Testing workaround for displaying plans...');
      const billingPlansContainer = document.querySelector('hr').nextElementSibling;

      if (billingPlansContainer && !billingPlansContainer.children.length) {
        console.log('Plans container found and is empty (as expected)');

        if (data.plans && window.documenso && window.documenso.BillingPlans && window.ReactDOM) {
          console.log('All dependencies for workaround are available');
          console.log('Workaround should work as described in the solution document');
        } else {
          console.warn('Some dependencies for workaround are missing:');
          console.log({
            plansDataAvailable: !!data.plans,
            BillingPlansComponentAvailable: !!(window.documenso && window.documenso.BillingPlans),
            ReactDOMAvailable: !!window.ReactDOM
          });
          console.log('Workaround may need adjustment');
        }
      }
    }
  } else {
    console.log('No subscription found - plans should be visible if user can manage billing');

    // Check if plans are visible as expected
    const plansContainer = document.querySelector('hr').nextElementSibling;
    const plansVisible = plansContainer && plansContainer.children.length > 0;

    if (plansVisible) {
      console.log('CONFIRMED: Plans are visible when no subscription exists (expected behavior)');
    } else {
      console.warn('UNEXPECTED: Plans are not visible despite no subscription');
      console.log('This might be due to the user not having permission to manage billing');
    }
  }

  // Check for billing portal button
  const billingPortalButton = Array.from(document.querySelectorAll('button')).find(
    button => button.textContent.includes('Billing Portal')
  );

  if (billingPortalButton) {
    console.log('CONFIRMED: Billing Portal button is available for accessing Stripe portal');
  } else {
    console.warn('Billing Portal button not found - user may not be able to access Stripe portal');
  }

  console.log('=== TEST COMPLETE ===');

  return {
    hasActiveSubscription: subscription?.organisationSubscription.status === 'ACTIVE',
    plansDataAvailable: !!data.plans,
    solutionAccurate: subscription?.organisationSubscription.status === 'ACTIVE' ?
      !document.querySelector('hr').nextElementSibling.children.length :
      !!document.querySelector('hr').nextElementSibling.children.length
  };
})();
