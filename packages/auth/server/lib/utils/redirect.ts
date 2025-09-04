import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

/**
 * Handle an optional redirect path.
 */
export const handleRequestRedirect = (redirectUrl?: string) => {
  if (!redirectUrl) {
    return;
  }

  const url = new URL(redirectUrl, NEXT_PUBLIC_WEBAPP_URL());

  if (url.origin !== NEXT_PUBLIC_WEBAPP_URL()) {
    window.location.href = '/';
  } else {
    window.location.href = redirectUrl;
  }
};

export const handleSignInRedirect = async (redirectUrl: string = '/') => {
  try {
    // Import dynamically to avoid circular dependencies
    const { authClient } = await import('@documenso/auth/client');
    const { isAdmin } = await import('@documenso/lib/utils/is-admin');

    // Get the user's session data
    const session = await authClient.getSession();

    // Check if the user is an admin
    if (session.user && isAdmin(session.user)) {
      // Redirect to admin panel if user is an admin
      window.location.href = '/admin';
      return;
    }

    // For regular users, use the provided redirectUrl or default to '/'
    const url = new URL(redirectUrl, NEXT_PUBLIC_WEBAPP_URL());

    if (url.origin !== NEXT_PUBLIC_WEBAPP_URL()) {
      window.location.href = '/';
    } else {
      window.location.href = redirectUrl;
    }
  } catch (error) {
    // If there's an error getting the session or checking the role,
    // fall back to the default redirection behavior
    const url = new URL(redirectUrl, NEXT_PUBLIC_WEBAPP_URL());

    if (url.origin !== NEXT_PUBLIC_WEBAPP_URL()) {
      window.location.href = '/';
    } else {
      window.location.href = redirectUrl;
    }
  }
};
