import type { HTMLAttributes } from 'react';

import { Trans } from '@lingui/react/macro';
import {
  BracesIcon,
  CreditCardIcon,
  Globe2Icon,
  Lock,
  MailIcon,
  PaletteIcon,
  Settings2Icon,
  User,
  Users,
  WebhookIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

import { useSession } from '@documenso/lib/client-only/providers/session';
import { IS_BILLING_ENABLED } from '@documenso/lib/constants/app';
import { isPersonalLayout } from '@documenso/lib/utils/organisations';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

export type SettingsMobileNavProps = HTMLAttributes<HTMLDivElement>;

export const SettingsMobileNav = ({ className, ...props }: SettingsMobileNavProps) => {
  const { pathname } = useLocation();

  const { organisations } = useSession();

  const isPersonalLayoutMode = isPersonalLayout(organisations);

  return (
    <div
      className={cn('flex flex-wrap items-center justify-start gap-x-2 gap-y-4', className)}
      {...props}
    >
      <Link to="/settings/profile">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith('/settings/profile') && 'bg-secondary',
          )}
        >
          <User className="mr-2 h-5 w-5" />
          <Trans>Profile</Trans>
        </Button>
      </Link>

      {(
        <>



          <Link to="/settings/email">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/email') && 'bg-secondary',
              )}
            >
              <MailIcon className="mr-2 h-5 w-5" />
              <Trans>Email Preferences</Trans>
            </Button>
          </Link>


          <Link to="/settings/billing">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                pathname?.startsWith('/settings/billing') && 'bg-secondary',
              )}
            >
              <CreditCardIcon className="mr-2 h-5 w-5" />
              <Trans>Billing</Trans>
            </Button>
          </Link>
        </>
      )}

      <Link to="/settings/security">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start',
            pathname?.startsWith('/settings/security') && 'bg-secondary',
          )}
        >
          <Lock className="mr-2 h-5 w-5" />
          <Trans>Security</Trans>
        </Button>
      </Link>
    </div>
  );
};
