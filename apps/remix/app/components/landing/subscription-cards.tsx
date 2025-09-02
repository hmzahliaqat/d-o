import { Trans } from '@lingui/react/macro';
import { CheckIcon } from 'lucide-react';
import { Link } from 'react-router';

import { useOptionalSession } from '@documenso/lib/client-only/providers/session';
import { INTERNAL_CLAIM_ID, SUBSCRIPTION_CLAIM_FEATURE_FLAGS, internalClaims } from '@documenso/lib/types/subscription';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@documenso/ui/primitives/card';

export const SubscriptionCards = () => {
  // Get session data to check if user is authenticated
  const { sessionData } = useOptionalSession();
  const isAuthenticated = !!sessionData;

  // Define the subscription tiers we want to display on the landing page
  const displayedTiers = [
    INTERNAL_CLAIM_ID.FREE,
    INTERNAL_CLAIM_ID.INDIVIDUAL,
    INTERNAL_CLAIM_ID.TEAM,
    INTERNAL_CLAIM_ID.ENTERPRISE,
  ];

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <h2 className="text-3xl font-bold text-center mb-4">
          <Trans>Subscription Plans</Trans>
        </h2>

        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          <Trans>
            Choose the perfect plan for your document signing needs. From individual users to enterprise teams, we have you covered.
          </Trans>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedTiers.map((tierId) => {
            const tier = internalClaims[tierId];
            const isPopular = tierId === INTERNAL_CLAIM_ID.TEAM;

            return (
              <Card
                key={tier.id}
                className={cn(
                  "flex flex-col h-full",
                  isPopular && "border-primary shadow-md"
                )}
              >
                {isPopular && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                    <Trans>Most Popular</Trans>
                  </div>
                )}

                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>
                    {tier.teamCount === 0 ? (
                      <Trans>Unlimited teams</Trans>
                    ) : tier.teamCount === 1 ? (
                      <Trans>1 team</Trans>
                    ) : (
                      <Trans>{tier.teamCount} teams</Trans>
                    )}

                    {tier.memberCount === 0 ? (
                      <Trans>, Unlimited members</Trans>
                    ) : tier.memberCount === 1 ? (
                      <Trans>, 1 member</Trans>
                    ) : (
                      <Trans>, {tier.memberCount} members</Trans>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-2">
                    {Object.entries(SUBSCRIPTION_CLAIM_FEATURE_FLAGS).map(([key, { label }]) => {
                      const isIncluded = tier.flags[key as keyof typeof tier.flags];

                      return (
                        <li
                          key={key}
                          className={cn(
                            "flex items-start gap-2",
                            !isIncluded && "text-muted-foreground"
                          )}
                        >
                          {isIncluded ? (
                            <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <span className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span className="text-sm">{label}</span>
                        </li>
                      );
                    })}

                    {tierId === INTERNAL_CLAIM_ID.FREE && (
                      <li className="flex items-start gap-2">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                          <Trans>Limited documents</Trans>
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                  >
                    <Link
                      to={isAuthenticated ? "/settings/billing" : "/signup"}
                    >
                      <Trans>Get Started</Trans>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
