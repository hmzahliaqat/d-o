import { useMemo } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { DocumentStatus } from '@prisma/client';
import { ExtendedDocumentStatus } from '@documenso/prisma/types/extended-document-status';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { trpc } from '@documenso/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@documenso/ui/primitives/card';
import { Skeleton } from '@documenso/ui/primitives/skeleton';

import { useCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Dashboard');
}

export default function DashboardPage() {
  const { _ } = useLingui();
  const organisation = useCurrentOrganisation();
  const team = useCurrentTeam();

  // Fetch employee data
  const { data: employeeData, isLoading: isLoadingEmployees } = trpc.employee.find.useQuery(
    {
      teamId: team.id,
      perPage: 100, // Maximum allowed value for fetching employees
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );

  // Fetch document statistics
  const { data: documentData, isLoading: isLoadingDocuments } = trpc.document.findDocumentsInternal.useQuery(
    {
      perPage: 10,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );

  // Calculate total employees
  const totalEmployees = employeeData?.data.length || 0;

  // Calculate document statistics
  const totalDocuments = documentData?.stats?.[ExtendedDocumentStatus.ALL] || 0;
  const pendingDocuments = documentData?.stats?.[ExtendedDocumentStatus.PENDING] || 0;
  const completedDocuments = documentData?.stats?.[ExtendedDocumentStatus.COMPLETED] || 0;
  const draftDocuments = documentData?.stats?.[ExtendedDocumentStatus.DRAFT] || 0;
  const rejectedDocuments = documentData?.stats?.[ExtendedDocumentStatus.REJECTED] || 0;

  // Prepare data for document status pie chart
  const documentStatusData = useMemo(() => {
    return [
      { name: 'Completed', value: completedDocuments, color: '#10b981' },
      { name: 'Pending', value: pendingDocuments, color: '#f59e0b' },
      { name: 'Draft', value: draftDocuments, color: '#6b7280' },
      { name: 'Rejected', value: rejectedDocuments, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  }, [completedDocuments, pendingDocuments, draftDocuments, rejectedDocuments]);

  // Prepare data for document completion rate chart
  const documentCompletionData = useMemo(() => {
    const total = completedDocuments + pendingDocuments;
    if (total === 0) return [];

    const completionRate = Math.round((completedDocuments / total) * 100);
    const pendingRate = 100 - completionRate;

    return [
      { name: 'Completed', value: completionRate, color: '#10b981' },
      { name: 'Pending', value: pendingRate, color: '#f59e0b' },
    ];
  }, [completedDocuments, pendingDocuments]);

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-8">
        <div className="flex flex-row items-center">
          <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
            {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
            <AvatarFallback className="text-muted-foreground text-xs">
              {team.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-4xl font-semibold">
            <Trans>Dashboard</Trans>
          </h2>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Employees Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              <Trans>Total Employees</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>Number of employees in your team</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEmployees ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-4xl font-bold">{totalEmployees}</div>
            )}
          </CardContent>
        </Card>

        {/* Total Documents Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              <Trans>Total Documents</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>Number of documents in your team</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDocuments ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="text-4xl font-bold">{totalDocuments}</div>
            )}
          </CardContent>
        </Card>

        {/* Signed vs Pending Documents Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              <Trans>Document Completion</Trans>
            </CardTitle>
            <CardDescription>
              <Trans>Signed vs pending documents</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDocuments ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">{completedDocuments}</div>
                  <div className="text-muted-foreground text-sm">
                    <Trans>Completed</Trans>
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{pendingDocuments}</div>
                  <div className="text-muted-foreground text-sm">
                    <Trans>Pending</Trans>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold">
          <Trans>Document Analytics</Trans>
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Document Status Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Document Status Distribution</Trans>
              </CardTitle>
              <CardDescription>
                <Trans>Distribution of documents by status</Trans>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <Skeleton className="h-64 w-full" />
              ) : documentStatusData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={documentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {documentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Documents']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-muted-foreground">No document data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Completion Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans>Document Completion Rate</Trans>
              </CardTitle>
              <CardDescription>
                <Trans>Percentage of completed vs pending documents</Trans>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <Skeleton className="h-64 w-full" />
              ) : documentCompletionData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={documentCompletionData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {documentCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-muted-foreground">No document data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights Section */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold">
            <Trans>Additional Insights</Trans>
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Documents per Employee Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>
                  <Trans>Documents per Employee</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>Average number of documents per employee</Trans>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEmployees || isLoadingDocuments ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-4xl font-bold">
                    {totalEmployees > 0
                      ? (totalDocuments / totalEmployees).toFixed(1)
                      : '0'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completion Rate Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>
                  <Trans>Completion Rate</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>Percentage of completed documents</Trans>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-4xl font-bold">
                    {totalDocuments > 0
                      ? `${Math.round((completedDocuments / totalDocuments) * 100)}%`
                      : '0%'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rejection Rate Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>
                  <Trans>Rejection Rate</Trans>
                </CardTitle>
                <CardDescription>
                  <Trans>Percentage of rejected documents</Trans>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDocuments ? (
                  <Skeleton className="h-12 w-24" />
                ) : (
                  <div className="text-4xl font-bold">
                    {totalDocuments > 0
                      ? `${Math.round((rejectedDocuments / totalDocuments) * 100)}%`
                      : '0%'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
