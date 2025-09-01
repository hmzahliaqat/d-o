import { useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import type * as DialogPrimitive from '@radix-ui/react-dialog';

import { trpc } from '@documenso/trpc/react';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { AvatarWithText } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

export type EmployeeDeleteDialogProps = {
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  trigger?: React.ReactNode;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

export const EmployeeDeleteDialog = ({
  employeeId,
  employeeName,
  employeeEmail,
  trigger,
  ...props
}: EmployeeDeleteDialogProps) => {
  const [open, setOpen] = useState(false);

  const { t } = useLingui();
  const { toast } = useToast();

  const team = useCurrentTeam();

  const { mutateAsync: deleteEmployee, isPending } = trpc.employee.delete.useMutation({
    onSuccess: () => {
      toast({
        title: t`Success`,
        description: t`Employee has been deleted.`,
        duration: 5000,
      });

      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: t`Error`,
        description: error.message || t`An error occurred while deleting the employee.`,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const onDelete = async () => {
    await deleteEmployee({
      id: employeeId,
      teamId: team.id,
    });
  };

  return (
    <Dialog {...props} open={open} onOpenChange={(value) => !isPending && setOpen(value)}>
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            <Trans>Are you sure?</Trans>
          </DialogTitle>

          <DialogDescription className="mt-4">
            <Trans>
              You are about to delete the following employee from{' '}
              <span className="font-semibold">{team.name}</span>.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <Alert variant="neutral" padding="tight">
          <AvatarWithText
            avatarClass="h-12 w-12"
            avatarFallback={employeeName.slice(0, 1).toUpperCase()}
            primaryText={<span className="font-semibold">{employeeName}</span>}
            secondaryText={employeeEmail}
          />
        </Alert>

        <fieldset disabled={isPending}>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              <Trans>Cancel</Trans>
            </Button>

            <Button
              type="button"
              variant="destructive"
              loading={isPending}
              onClick={onDelete}
            >
              <Trans>Delete</Trans>
            </Button>
          </DialogFooter>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};
