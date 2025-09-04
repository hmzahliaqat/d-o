# Role-Based Redirection Implementation

## Overview

This document explains the changes made to implement role-based redirection after user login:

- Admin users are redirected to the admin panel (`/admin`)
- Regular users are redirected to the dashboard (`/`)

## Changes Made

The implementation involved modifying the `handleSignInRedirect` function in `packages/auth/server/lib/utils/redirect.ts` to check the user's role after successful authentication and redirect accordingly.

### Before

```javascript
export const handleSignInRedirect = (redirectUrl: string = '/') => {
  const url = new URL(redirectUrl, NEXT_PUBLIC_WEBAPP_URL());

  if (url.origin !== NEXT_PUBLIC_WEBAPP_URL()) {
    window.location.href = '/';
  } else {
    window.location.href = redirectUrl;
  }
};
```

### After

```javascript
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
```

## How It Works

1. After successful authentication, the `handleSignInRedirect` function is called.
2. The function gets the user's session data using `authClient.getSession()`.
3. It checks if the user has the admin role using the `isAdmin` function.
4. If the user is an admin, they are redirected to `/admin`.
5. If the user is not an admin, they are redirected to the provided URL or default path (`/`).
6. Error handling is included to fall back to the default redirection behavior if there's an error.

## Benefits

- Centralized implementation that works for all authentication methods (email/password, Google, OIDC, passkey)
- Minimal changes to the codebase
- Maintains security by checking the user's role after authentication
- Preserves the existing functionality for non-admin users

## Testing

To test this implementation:
1. Log in with an admin user account - you should be redirected to `/admin`
2. Log in with a regular user account - you should be redirected to `/`
