import { redirect } from 'react-router';

import { getOptionalSession } from '@documenso/auth/server/lib/utils/get-session';
import { formatDashboardPath } from '@documenso/lib/utils/teams';
import { getOrganisationSession } from '@documenso/trpc/server/organisation-router/get-organisation-session';

import type { Route } from './+types/dashboard';

export async function loader({ request }: Route.LoaderArgs) {
  // Ensure user is authenticated
  const session = await getOptionalSession(request);

  if (!session.isAuthenticated) {
    // Not authenticated, send to landing page (or signin if desired)
    throw redirect('/');
  }

  // Fetch all orgs and teams for the user
  const organisations = await getOrganisationSession({ userId: session.user.id });

  // Pick a team to redirect to: prefer a personal_* team, otherwise first available team
  let targetTeamUrl: string | null = null;

  for (const org of organisations) {
    const personalTeam = org.teams.find((t) => t.url?.startsWith('personal_'));
    if (personalTeam) {
      targetTeamUrl = personalTeam.url;
      break;
    }
  }

  if (!targetTeamUrl) {
    // Fallback to the first team found across all organisations
    for (const org of organisations) {
      if (org.teams.length > 0) {
        targetTeamUrl = org.teams[0].url;
        break;
      }
    }
  }

  if (targetTeamUrl) {
    throw redirect(formatDashboardPath(targetTeamUrl));
  }

  // No teams available. Redirect to the first organisation overview if present so user can create/select a team
  if (organisations.length > 0) {
    throw redirect(`/o/${organisations[0].url}`);
  }

  // As a last resort, go home
  throw redirect('/');
}
