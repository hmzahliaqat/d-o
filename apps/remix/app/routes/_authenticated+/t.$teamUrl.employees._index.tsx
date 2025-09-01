import { useMemo } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { EditIcon, MoreHorizontal, PlusIcon, Trash2Icon } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { ZUrlSearchParamsSchema } from '@documenso/lib/types/search-params';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { trpc } from '@documenso/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import type { DataTableColumnDef } from '@documenso/ui/primitives/data-table';
import { DataTable } from '@documenso/ui/primitives/data-table';
import { DataTablePagination } from '@documenso/ui/primitives/data-table-pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@documenso/ui/primitives/dropdown-menu';
import { Skeleton } from '@documenso/ui/primitives/skeleton';
import { TableCell } from '@documenso/ui/primitives/table';

import { EmployeeCreateDialog } from '~/components/dialogs/employee-create-dialog';
import { EmployeeDeleteDialog } from '~/components/dialogs/employee-delete-dialog';
import { EmployeeUpdateDialog } from '~/components/dialogs/employee-update-dialog';
import { useCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Employees');
}

export default function EmployeesPage() {
  const { _ } = useLingui();
  const organisation = useCurrentOrganisation();
  const team = useCurrentTeam();

  const [searchParams] = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const parsedSearchParams = ZUrlSearchParamsSchema.parse(Object.fromEntries(searchParams ?? []));

  const { data, isLoading, isLoadingError } = trpc.employee.find.useQuery(
    {
      teamId: team.id,
      query: parsedSearchParams.query,
      page: parsedSearchParams.page,
      perPage: parsedSearchParams.perPage,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );

  const onPaginationChange = (page: number, perPage: number) => {
    updateSearchParams({
      page,
      perPage,
    });
  };

  const results = data ?? {
    data: [],
    perPage: 10,
    currentPage: 1,
    totalPages: 1,
  };

  const columns = useMemo(() => {
    return [
      {
        header: _(msg`Name`),
        accessorKey: 'employee_name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.employee_name}</span>
        ),
      },
      {
        header: _(msg`ID`),
        accessorKey: 'employee_id',
      },
      {
        header: _(msg`Email`),
        accessorKey: 'employee_email',
      },
      {
        header: _(msg`Actions`),
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="text-muted-foreground h-5 w-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52" align="start" forceMount>
              <DropdownMenuLabel>
                <Trans>Actions</Trans>
              </DropdownMenuLabel>

              <EmployeeUpdateDialog
                employeeId={row.original.id}
                employeeData={{
                  employee_id: row.original.employee_id,
                  employee_name: row.original.employee_name,
                  employee_email: row.original.employee_email,
                }}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    title={_(msg`Edit employee`)}
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    <Trans>Edit</Trans>
                  </DropdownMenuItem>
                }
              />

              <EmployeeDeleteDialog
                employeeId={row.original.id}
                employeeName={row.original.employee_name}
                employeeEmail={row.original.employee_email}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    title={_(msg`Delete employee`)}
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    <Trans>Delete</Trans>
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ] satisfies DataTableColumnDef<(typeof results)['data'][number]>[];
  }, [_]);

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
            <Trans>Employees</Trans>
          </h2>
        </div>

        <div className="flex flex-row items-center gap-x-2">
          <EmployeeCreateDialog
            trigger={
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                <Trans>Add Employee</Trans>
              </Button>
            }
          />
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          columns={columns}
          data={results.data}
          perPage={results.perPage}
          currentPage={results.currentPage}
          totalPages={results.totalPages}
          onPaginationChange={onPaginationChange}
          error={{
            enable: isLoadingError,
          }}
          skeleton={{
            enable: isLoading,
            rows: 3,
            component: (
              <>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-6 rounded-full" />
                </TableCell>
              </>
            ),
          }}
        >
          {(table) => <DataTablePagination additionalInformation="VisibleCount" table={table} />}
        </DataTable>
      </div>
    </div>
  );
}
