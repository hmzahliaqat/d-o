import { Trans } from '@lingui/react/macro';
import {
  BarChart3,
  Building2Icon,
  FileStack,
  Settings,
  Shield,
  Users,
  Wallet2,
} from 'lucide-react';
import { Link, Outlet, redirect, useLocation } from 'react-router';

import { getSession } from '@documenso/auth/server/lib/utils/get-session';
import { isSuperAdmin } from '@documenso/lib/utils/is-super-admin';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

import type { Route } from './+types/_layout';

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await getSession(request);

  if (!user || !isSuperAdmin(user)) {
    throw redirect('/');
  }
}

export default function SuperAdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <h1 className="text-4xl font-semibold">
        <Trans>Super Admin Dashboard</Trans>
      </h1>

      <div className="mt-4 grid grid-cols-12 gap-x-8 md:mt-8">
        <div
          className={cn(
            'col-span-12 flex gap-x-2.5 gap-y-2 overflow-hidden overflow-x-auto md:col-span-3 md:flex md:flex-col',
          )}
        >
          <Button
            variant="ghost"
            className={cn(
              'justify-start md:w-full',
              pathname?.startsWith('/super-admin/dashboard') && 'bg-secondary',
            )}
            asChild
          >
            <Link to="/super-admin/dashboard">
              <BarChart3 className="mr-2 h-5 w-5" />
              <Trans>Dashboard</Trans>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              'justify-start md:w-full',
              pathname?.startsWith('/super-admin/users') && 'bg-secondary',
            )}
            asChild
          >
            <Link to="/super-admin/users">
              <Users className="mr-2 h-5 w-5" />
              <Trans>User Management</Trans>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              'justify-start md:w-full',
              pathname?.startsWith('/super-admin/organisations') && 'bg-secondary',
            )}
            asChild
          >
            <Link to="/super-admin/organisations">
              <Building2Icon className="mr-2 h-5 w-5" />
              <Trans>Organisations</Trans>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              'justify-start md:w-full',
              pathname?.startsWith('/super-admin/documents') && 'bg-secondary',
            )}
            asChild
          >
            <Link to="/super-admin/documents">
              <FileStack className="mr-2 h-5 w-5" />
              <Trans>Documents</Trans>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              'justify-start md:w-full',
              pathname?.startsWith('/super-admin/security') && 'bg-secondary',
            )}
            asChild
          >
            <Link to="/super-admin/security">
              <Shield className="mr-2 h-5 w-5" />
              <Trans>Security</Trans>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className={cn(
              'justify-start md:w-full',
              pathname?.startsWith('/super-admin/settings') && 'bg-secondary',
            )}
            asChild
          >
            <Link to="/super-admin/settings">
              <Settings className="mr-2 h-5 w-5" />
              <Trans>System Settings</Trans>
            </Link>
          </Button>
        </div>

        <div className="col-span-12 mt-12 md:col-span-9 md:mt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
