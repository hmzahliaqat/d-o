import { redirect } from 'react-router';

import { extractCookieFromHeaders } from '@documenso/auth/server/lib/utils/cookies';
import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import { getTeams } from '@documenso/lib/server-only/team/get-teams';
import { formatDashboardPath } from '@documenso/lib/utils/teams';
import { isAdmin } from '@documenso/lib/utils/is-admin';
import { ZTeamUrlSchema } from '@documenso/trpc/server/team-router/schema';

import { LandingPage } from '~/components/landing/landing-page';

import type { Route } from './+types/_index';

export async function loader({ request }: Route.LoaderArgs) {
  // Get the session but don't redirect authenticated users
  // This allows both authenticated and unauthenticated users to access the landing page
  const session = await getOptionalSession(request);

  // Return an empty object - the LandingPage component will use useOptionalSession()
  // to determine if the user is authenticated and show appropriate UI
  return {};
}

export default function Index() {
  return <LandingPage />;
}
