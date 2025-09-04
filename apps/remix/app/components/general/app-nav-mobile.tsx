import { useMemo } from 'react';

import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react/macro';
import { ReadStatus } from '@prisma/client';
import { Link, useLocation } from 'react-router';

// Using logo22.png directly from public directory
import { authClient } from '@documenso/auth/client';
import { useSession } from '@documenso/lib/client-only/providers/session';
import { isPersonalLayout } from '@documenso/lib/utils/organisations';
import { isAdmin } from '@documenso/lib/utils/is-admin';
import { trpc } from '@documenso/trpc/react';
import { Sheet, SheetContent } from '@documenso/ui/primitives/sheet';
import { ThemeSwitcher } from '@documenso/ui/primitives/theme-switcher';

import { useOptionalCurrentTeam } from '~/providers/team';

export type AppNavMobileProps = {
  isMenuOpen: boolean;
  onMenuOpenChange?: (_value: boolean) => void;
};

export const AppNavMobile = ({ isMenuOpen, onMenuOpenChange }: AppNavMobileProps) => {
  const { t } = useLingui();

  const { organisations, user } = useSession();
  const isAdminUser = user ? isAdmin(user) : false;

  const currentTeam = useOptionalCurrentTeam();

  const { data: unreadCountData } = trpc.document.inbox.getCount.useQuery(
    {
      readStatus: ReadStatus.NOT_OPENED,
    },
    {
      // refetchInterval: 30000, // Refetch every 30 seconds
    },
  );

  const handleMenuItemClick = () => {
    onMenuOpenChange?.(false);
  };

  const { pathname } = useLocation();

  const menuNavigationLinks = useMemo(() => {
    // Check if we're in the admin section based on the current path
    const isInAdminSection = pathname?.startsWith('/super-admin');

    // If user is an admin and currently in the admin section, show admin specific links
    if (isAdminUser && isInAdminSection) {
      return [
        {
          href: '/super-admin/dashboard',
          text: t`Dashboard`,
        },
        {
          href: '/super-admin/users',
          text: t`User Management`,
        },
        {
          href: '/super-admin/organisations',
          text: t`Organisations`,
        },
        {
          href: '/super-admin/documents',
          text: t`Documents`,
        },
        {
          href: '/super-admin/security',
          text: t`Security`,
        },
        {
          href: '/super-admin/settings',
          text: t`System Settings`,
        },
        {
          href: '/inbox',
          text: t`Inbox`,
        },
        {
          href: '/settings/profile',
          text: t`Settings`,
        },
      ];
    }

    // Regular user navigation
    let teamUrl = currentTeam?.url || null;

    if (!teamUrl && isPersonalLayout(organisations)) {
      teamUrl = organisations[0].teams[0]?.url || null;
    }

    if (!teamUrl) {
      return [
        {
          href: '/inbox',
          text: t`Inbox`,
        },
        {
          href: '/settings/profile',
          text: t`Settings`,
        },
      ];
    }

    // Define all regular navigation links
    const regularLinks = [
      {
        href: `/t/${teamUrl}/dashboard`,
        text: t`Dashboard`,
      },
      {
        href: `/t/${teamUrl}/documents`,
        text: t`Documents`,
      },
      {
        href: `/t/${teamUrl}/templates`,
        text: t`Templates`,
      },
      {
        href: `/t/${teamUrl}/employees`,
        text: t`Employees`,
      },
      {
        href: '/inbox',
        text: t`Inbox`,
      },
      {
        href: '/settings/profile',
        text: t`Settings`,
      },
    ];

    // If user is an admin, filter out dashboard, documents, templates, employees, and inbox links
    if (isAdminUser) {
      return regularLinks.filter(link =>
        !link.href.includes('/dashboard') &&
        !link.href.includes('/documents') &&
        !link.href.includes('/templates') &&
        !link.href.includes('/employees') &&
        !link.href.includes('/inbox')
      );
    }

    return regularLinks;
  }, [currentTeam, organisations, isAdminUser, t]);

  return (
    <Sheet open={isMenuOpen} onOpenChange={onMenuOpenChange}>
      <SheetContent className="flex w-full max-w-[350px] flex-col">
        <Link to="/" onClick={handleMenuItemClick}>
          <img
            src="/logo22.png"
            alt="Clickesignature"
            className="dark:invert"
            width={190}
            height={28}
          />
        </Link>

        <div className="mt-8 flex w-full flex-col items-start gap-y-4">
          {menuNavigationLinks.map(({ href, text }) => (
            <Link
              key={href}
              className="text-foreground hover:text-foreground/80 flex items-center gap-2 text-2xl font-semibold"
              to={href}
              onClick={() => handleMenuItemClick()}
            >
              {text}
              {href === '/inbox' && unreadCountData && unreadCountData.count > 0 && (
                <span className="bg-primary text-primary-foreground flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold">
                  {unreadCountData.count > 99 ? '99+' : unreadCountData.count}
                </span>
              )}
            </Link>
          ))}

          <button
            className="text-foreground hover:text-foreground/80 text-2xl font-semibold"
            onClick={async () => authClient.signOut()}
          >
            <Trans>Sign Out</Trans>
          </button>
        </div>

        <div className="mt-auto flex w-full flex-col space-y-4 self-end">
          <div className="w-fit">
            <ThemeSwitcher />
          </div>

          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Documenso, Inc. <br /> All rights reserved.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
