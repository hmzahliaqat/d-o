import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Link, Outlet, redirect, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { env } from '@documenso/lib/utils/env';

import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import { OrganisationProvider } from '@documenso/lib/client-only/providers/organisation';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { getSiteSettings } from '@documenso/lib/server-only/site-settings/get-site-settings';
import { SITE_SETTINGS_BANNER_ID } from '@documenso/lib/server-only/site-settings/schemas/banner';
import { Button } from '@documenso/ui/primitives/button';

import { AppBanner } from '~/components/general/app-banner';
import { Header } from '~/components/general/app-header';
import { GenericErrorLayout } from '~/components/general/generic-error-layout';
import { OrganisationBillingBanner } from '~/components/general/organisations/organisation-billing-banner';
import { VerifyEmailBanner } from '~/components/general/verify-email-banner';
import { TeamProvider } from '~/providers/team';

import type { Route } from './+types/_layout';

/**
 * Don't revalidate (run the loader on sequential navigations)
 *
 * Update values via providers.
 */
export const shouldRevalidate = () => false;

export async function loader({ request }: Route.LoaderArgs) {
  const [session, banner] = await Promise.all([
    getOptionalSession(request),
    getSiteSettings().then((settings) =>
      settings.find((setting) => setting.id === SITE_SETTINGS_BANNER_ID),
    ),
  ]);

  if (!session.isAuthenticated) {
    throw redirect('/signin');
  }

  return {
    banner,
  };
}


export default function Layout({ loaderData, params }: Route.ComponentProps) {

  const { banner } = loaderData;
  const { user, organisations } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const teamUrl = params.teamUrl;
  const orgUrl = params.orgUrl;
  const teams = organisations.flatMap((org) => org.teams);
  const extractCurrentOrganisation = () => {
    if (orgUrl) {
      return organisations.find((org) => org.url === orgUrl);
    }
    if (teamUrl) {
      return organisations.find((org) => org.teams.some((team) => team.url === teamUrl));
    }
    return null;
  };
  const currentTeam = teams.find((team) => team.url === teamUrl);
  const currentOrganisation = extractCurrentOrganisation() || null;
  const orgNotFound = params.orgUrl && !currentOrganisation;
  const teamNotFound = params.teamUrl && !currentTeam;

  // Check if organisation has an active subscription
  const hasActiveSubscription = currentOrganisation?.subscription?.status === 'ACTIVE';

  // --- Trial Expiry Frontend Guard ---
  const trialEnabled = env('NEXT_PUBLIC_TRAIL_PERIOD_ENABLED') === 'true';
  function isTrialExpired(createdAt: string | Date | undefined, trialDays = 3) {
    if (!createdAt) return false;
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    return now - created > trialDays * msInDay;
  }
  function getTrialDaysLeft(createdAt: string | Date | undefined, trialDays = 3) {
    if (!createdAt) return null;
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const daysPassed = Math.floor((now - created) / msInDay);
    const daysLeft = trialDays - daysPassed;
    return daysLeft > 0 ? daysLeft : 0;
  }
  const trialExpired = trialEnabled ? isTrialExpired(user?.createdAt, 3) : false;
  const trialDaysLeft = trialEnabled ? getTrialDaysLeft(user?.createdAt, 3) : null;
  // Hide trial banners on billing and settings pages if needed
  const isBillingRoute = location.pathname.includes('/settings/billing');
  const isSettingsRoute = location.pathname.includes('/settings');

  useEffect(() => {
    if (trialEnabled && trialExpired && !isBillingRoute) {
      navigate('/settings/billing', { replace: true });
    }
  }, [trialEnabled, trialExpired, isBillingRoute, navigate]);


  const trialBanner = trialEnabled && trialExpired ? (
    <div style={{ background: '#fef3c7', color: '#92400e' }} className="w-full text-center py-2 text-sm font-medium z-[100] flex flex-col items-center gap-1">
      <span>Your free trial has expired. Please upgrade your plan to continue using the application.</span>
      <Link
        to="/settings/billing"
        className="inline-block mt-1 px-3 py-1 rounded bg-yellow-300 text-yellow-900 font-semibold hover:bg-yellow-400 transition-colors text-xs border border-yellow-400"
      >
        Upgrade Now
      </Link>
    </div>
  ) : null;

  const trialDaysLeftBanner = trialEnabled && !trialExpired && typeof trialDaysLeft === 'number' && trialDaysLeft > 0 ? (
    <div style={{ background: '#fef3c7', color: '#92400e' }} className="w-full text-center py-2 text-sm font-medium z-[100] flex flex-col items-center gap-1">
      <span>Your free trial ends in {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'}. Upgrade now to keep using the application.</span>
      <Link
        to="/settings/billing"
        className="inline-block mt-1 px-3 py-1 rounded bg-yellow-300 text-yellow-900 font-semibold hover:bg-yellow-400 transition-colors text-xs border border-yellow-400"
      >
        Upgrade Now
      </Link>
    </div>
  ) : null;

  if (!hasActiveSubscription && trialEnabled && trialExpired && !isBillingRoute && !isSettingsRoute) {
    return (
      <>{trialBanner}</>
    );
  }

  if (orgNotFound || teamNotFound) {
    return (
      <GenericErrorLayout
        errorCode={404}
        errorCodeMap={{
          404: orgNotFound
            ? {
                heading: msg`Organisation not found`,
                subHeading: msg`404 Organisation not found`,
                message: msg`The organisation you are looking for may have been removed, renamed or may have never
                  existed.`,
              }
            : {
                heading: msg`Team not found`,
                subHeading: msg`404 Team not found`,
                message: msg`The team you are looking for may have been removed, renamed or may have never
                  existed.`,
              },
        }}
        primaryButton={
          <Button asChild>
            <Link to="/">
              <Trans>Go home</Trans>
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <OrganisationProvider organisation={currentOrganisation}>
      <TeamProvider team={currentTeam || null}>
        {/* Only show trial banners if not on settings or billing routes */}
        {!hasActiveSubscription && !isSettingsRoute && trialDaysLeftBanner}
        {!hasActiveSubscription && !isSettingsRoute && trialBanner}
        <OrganisationBillingBanner />
        {!user.emailVerified && <VerifyEmailBanner email={user.email} />}
        {banner && <AppBanner banner={banner} />}
        <Header />
        <main className="mt-8 pb-8 md:mt-12 md:pb-12">
          <Outlet />
        </main>
      </TeamProvider>
    </OrganisationProvider>
  );
}
