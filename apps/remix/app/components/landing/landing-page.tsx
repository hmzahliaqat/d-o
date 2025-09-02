import { Trans } from '@lingui/react/macro';
import { Link } from 'react-router';

import { useOptionalSession } from '@documenso/lib/client-only/providers/session';
import { env } from '@documenso/lib/utils/env';
import { isAdmin } from '@documenso/lib/utils/is-admin';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';

import { BrandingLogo } from '~/components/general/branding-logo';
import { SubscriptionCards } from './subscription-cards';

export const LandingPage = () => {
  const isSignupDisabled = env('NEXT_PUBLIC_DISABLE_SIGNUP') === 'true';

  // Get session data to check if user is authenticated
  const { sessionData } = useOptionalSession();
  const isAuthenticated = !!sessionData;

  // Check if user is an admin
  const isUserAdmin = sessionData?.user ? isAdmin(sessionData.user) : false;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Bar */}
      <header className="bg-background sticky top-0 z-40 w-full border-b">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center">
            <BrandingLogo className="h-10 w-auto" />
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              // Show Dashboard button for authenticated users
              <Button asChild>
                <Link to={isUserAdmin ? "/admin" : "/dashboard"}>
                  <Trans>Dashboard</Trans>
                </Link>
              </Button>
            ) : (
              // Show Login and Sign Up buttons for unauthenticated users
              <>
                <Button asChild variant="outline">
                  <Link to="/signin">
                    <Trans>Login</Trans>
                  </Link>
                </Button>

                {!isSignupDisabled && (
                  <Button asChild>
                    <Link to="/signup">
                      <Trans>Sign Up</Trans>
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-center px-4 py-16 text-center md:px-8 md:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <Trans>Welcome to Clickesignature</Trans>
          </h1>

          <p className="text-muted-foreground mt-6 max-w-prose text-lg">
            <Trans>
              The open-source document signing platform. Fast, secure, and easy to use.
            </Trans>
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              // Show Go to Dashboard button for authenticated users
              <Button asChild size="lg">
                <Link to={isUserAdmin ? "/admin" : "/dashboard"}>
                  <Trans>Go to Dashboard</Trans>
                </Link>
              </Button>
            ) : (
              // Show Get Started and Create an Account buttons for unauthenticated users
              <>
                <Button asChild size="lg">
                  <Link to="/signin">
                    <Trans>Get Started</Trans>
                  </Link>
                </Button>

                {!isSignupDisabled && (
                  <Button asChild variant="outline" size="lg">
                    <Link to="/signup">
                      <Trans>Create an Account</Trans>
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Video Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            <Trans>Watch Our Video</Trans>
          </h2>

          <div className="relative w-full max-w-4xl mx-auto" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Clickesignature Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          <p className="text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
            <Trans>
              Learn how Clickesignature can streamline your document signing process and improve your workflow.
            </Trans>
          </p>
        </div>
      </section>

      {/* Subscription Cards Section */}
      <SubscriptionCards />

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="mx-auto max-w-screen-xl px-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center">
              <BrandingLogo className="h-8 w-auto" />
              <p className="text-muted-foreground ml-2 text-sm">
                © {new Date().getFullYear()} Clickesignature, Inc.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
