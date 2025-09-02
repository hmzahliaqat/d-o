import { Trans } from '@lingui/react/macro';
import { Building2, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@documenso/ui/primitives/card';

import { trpc } from '@documenso/trpc/react';

export default function SuperAdminDashboard() {
  // Placeholder data - in a real implementation, these would be fetched from the server
  // using trpc queries specific to the super admin role
  const totalUsers = 152;
  const totalDocuments = 1243;
  const totalEmployees = 876;

  return (
    <div className="flex flex-col gap-y-6">
      <h2 className="text-3xl font-semibold">
        <Trans>Welcome, Super Admin</Trans>
      </h2>

      <p className="text-muted-foreground">
        <Trans>
          This is the super administrator dashboard. From here, you can manage all aspects of the
          system with elevated privileges.
        </Trans>
      </p>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans>Total Companies</Trans>
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <Trans>All registered organizations in the system</Trans>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans>Total Documents</Trans>
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              <Trans>All documents across all organizations</Trans>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              <Trans>Total Employees</Trans>
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              <Trans>All employees across all organizations</Trans>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>User Management</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>Manage all users in the system</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <Trans>
                View, edit, and manage user accounts. Add or remove admin privileges, reset passwords,
                and more.
              </Trans>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>Organisation Management</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>Manage all organisations</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <Trans>
                View and manage all organisations in the system. Adjust settings, manage members, and
                handle subscriptions.
              </Trans>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>Document Management</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>Access all documents</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <Trans>
                View and manage all documents in the system. Monitor document status, resolve issues,
                and ensure compliance.
              </Trans>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>Security</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>System security settings</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <Trans>
                Manage security settings, view audit logs, and monitor system access. Ensure the
                platform remains secure and compliant.
              </Trans>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans>System Settings</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>Configure global settings</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <Trans>
                Manage global system settings, configure defaults, and adjust system-wide parameters.
              </Trans>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
