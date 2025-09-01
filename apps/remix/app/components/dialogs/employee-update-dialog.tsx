import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { trpc } from '@documenso/trpc/react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useCurrentTeam } from '~/providers/team';

export type EmployeeUpdateDialogProps = {
  employeeId: number;
  employeeData: {
    employee_id: string;
    employee_name: string;
    employee_email: string;
  };
  trigger?: React.ReactNode;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZEmployeeUpdateFormSchema = z.object({
  employee_id: z.string().min(1, { message: 'Employee ID is required' }),
  employee_name: z.string().min(1, { message: 'Employee name is required' }),
  employee_email: z.string().email({ message: 'Please enter a valid email address' }),
});

type TEmployeeUpdateFormSchema = z.infer<typeof ZEmployeeUpdateFormSchema>;

export const EmployeeUpdateDialog = ({
  employeeId,
  employeeData,
  trigger,
  ...props
}: EmployeeUpdateDialogProps) => {
  const [open, setOpen] = useState(false);

  const { t } = useLingui();
  const { toast } = useToast();

  const team = useCurrentTeam();

  const form = useForm<TEmployeeUpdateFormSchema>({
    resolver: zodResolver(ZEmployeeUpdateFormSchema),
    defaultValues: {
      employee_id: employeeData.employee_id,
      employee_name: employeeData.employee_name,
      employee_email: employeeData.employee_email,
    },
  });

  const { mutateAsync: updateEmployee, isPending } = trpc.employee.update.useMutation({
    onSuccess: () => {
      toast({
        title: t`Success`,
        description: t`Employee has been updated.`,
        duration: 5000,
      });

      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: t`Error`,
        description: error.message || t`An error occurred while updating the employee.`,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const onFormSubmit = async (values: TEmployeeUpdateFormSchema) => {
    await updateEmployee({
      id: employeeId,
      teamId: team.id,
      data: values,
    });
  };

  useEffect(() => {
    if (open) {
      form.reset({
        employee_id: employeeData.employee_id,
        employee_name: employeeData.employee_name,
        employee_email: employeeData.employee_email,
      });
    }
  }, [open, employeeData, form]);

  return (
    <Dialog {...props} open={open} onOpenChange={(value) => !isPending && setOpen(value)}>
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            <Trans>Update Employee</Trans>
          </DialogTitle>

          <DialogDescription>
            <Trans>Update the details of the employee.</Trans>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <fieldset disabled={isPending} className="space-y-4">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      <Trans>Employee ID</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t`Enter employee ID`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      <Trans>Employee Name</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t`Enter employee name`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employee_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      <Trans>Employee Email</Trans>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t`Enter employee email`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  <Trans>Cancel</Trans>
                </Button>

                <Button type="submit" loading={isPending}>
                  <Trans>Update</Trans>
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
