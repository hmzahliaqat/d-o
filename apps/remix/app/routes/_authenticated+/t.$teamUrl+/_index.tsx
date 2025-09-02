import { redirect } from 'react-router';

import { formatDashboardPath } from '@documenso/lib/utils/teams';

import type { Route } from './+types/_index';

export function loader({ params }: Route.LoaderArgs) {
  throw redirect(formatDashboardPath(params.teamUrl));
}
