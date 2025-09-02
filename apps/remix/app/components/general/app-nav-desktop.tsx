import type { HTMLAttributes } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Link, useLocation } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { isPersonalLayout } from '@documenso/lib/utils/organisations';
import { isAdmin } from '@documenso/lib/utils/is-admin';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

import { useOptionalCurrentTeam } from '~/providers/team';

export type AppNavDesktopProps = HTMLAttributes<HTMLDivElement> & {
  setIsCommandMenuOpen: (value: boolean) => void;
};

export const AppNavDesktop = ({
  className,
  setIsCommandMenuOpen,
  ...props
}: AppNavDesktopProps) => {
  const { _ } = useLingui();
  const { organisations, user } = useSession();
  const isAdminUser = user ? isAdmin(user) : false;

  const { pathname } = useLocation();

  const [modifierKey, setModifierKey] = useState(() => 'Ctrl');

  const currentTeam = useOptionalCurrentTeam();

  useEffect(() => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const isMacOS = /Macintosh|Mac\s+OS\s+X/i.test(userAgent);

    setModifierKey(isMacOS ? '⌘' : 'Ctrl');
  }, []);

  const menuNavigationLinks = useMemo(() => {
    // Check if we're in the admin section based on the current path
    const isInAdminSection = pathname?.startsWith('/super-admin');

    // If user is an admin and currently in the admin section, show admin specific links
    if (isAdminUser && isInAdminSection) {
      return [
        {
          href: '/super-admin/dashboard',
          label: msg`Dashboard`,
        },
        {
          href: '/super-admin/users',
          label: msg`User Management`,
        },
        {
          href: '/super-admin/organisations',
          label: msg`Organisations`,
        },
        {
          href: '/super-admin/documents',
          label: msg`Documents`,
        },
        {
          href: '/super-admin/security',
          label: msg`Security`,
        },
        {
          href: '/super-admin/settings',
          label: msg`System Settings`,
        },
      ];
    }

    // Regular user navigation
    let teamUrl = currentTeam?.url || null;

    if (!teamUrl && isPersonalLayout(organisations)) {
      teamUrl = organisations[0].teams[0]?.url || null;
    }

    if (!teamUrl) {
      return [];
    }

    // Define all regular navigation links
    const regularLinks = [
      {
        href: `/t/${teamUrl}/dashboard`,
        label: msg`Dashboard`,
      },
      {
        href: `/t/${teamUrl}/documents`,
        label: msg`Documents`,
      },
      {
        href: `/t/${teamUrl}/templates`,
        label: msg`Templates`,
      },
      {
        href: `/t/${teamUrl}/employees`,
        label: msg`Employees`,
      },
    ];

    // If user is an admin, filter out dashboard, documents, templates, and employees links
    if (isAdminUser) {
      return regularLinks.filter(link =>
        !link.href.includes('/dashboard') &&
        !link.href.includes('/documents') &&
        !link.href.includes('/templates') &&
        !link.href.includes('/employees')
      );
    }

    return regularLinks;
  }, [currentTeam, organisations, isAdminUser]);

  return (
    <div
      className={cn(
        'ml-8 hidden flex-1 items-center gap-x-12 md:flex md:justify-between',
        className,
      )}
      {...props}
    >
      <div>
        <AnimatePresence>
          {menuNavigationLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-baseline gap-x-6"
            >
              {menuNavigationLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    'text-muted-foreground dark:text-muted-foreground/60 focus-visible:ring-ring ring-offset-background rounded-md font-medium leading-5 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2',
                    {
                      'text-foreground dark:text-muted-foreground': pathname?.startsWith(href),
                    },
                  )}
                >
                  {_(label)}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hide search button for admin users */}
      {!isAdminUser && (
        <Button
          variant="outline"
          className="text-muted-foreground flex w-full max-w-96 items-center justify-between rounded-lg"
          onClick={() => setIsCommandMenuOpen(true)}
        >
          <div className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            <Trans>Search</Trans>
          </div>

          <div>
            <div className="text-muted-foreground bg-muted flex items-center rounded-md px-1.5 py-0.5 text-xs tracking-wider">
              {modifierKey}+K
            </div>
          </div>
        </Button>
      )}
    </div>
  );
};
