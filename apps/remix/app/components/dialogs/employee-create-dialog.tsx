import { useState } from 'react';

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

export type EmployeeCreateDialogProps = {
  trigger?: React.ReactNode;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZEmployeeCreateFormSchema = z.object({
  employee_id: z.string().min(1, { message: 'Employee ID is required' }),
  employee_name: z.string().min(1, { message: 'Employee name is required' }),
  employee_email: z.string().email({ message: 'Please enter a valid email address' }),
});

type TEmployeeCreateFormSchema = z.infer<typeof ZEmployeeCreateFormSchema>;

export const EmployeeCreateDialog = ({ trigger, ...props }: EmployeeCreateDialogProps) => {
  const [open, setOpen] = useState(false);

  const { t } = useLingui();
  const { toast } = useToast();

  const team = useCurrentTeam();

  const form = useForm<TEmployeeCreateFormSchema>({
    resolver: zodResolver(ZEmployeeCreateFormSchema),
    defaultValues: {
      employee_id: '',
      employee_name: '',
      employee_email: '',
    },
  });

  const { mutateAsync: createEmployee, isPending } = trpc.employee.create.useMutation({
    onSuccess: () => {
      toast({
        title: t`Success`,
        description: t`Employee has been created.`,
        duration: 5000,
      });

      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t`Error`,
        description: error.message || t`An error occurred while creating the employee.`,
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  const onFormSubmit = async (values: TEmployeeCreateFormSchema) => {
    await createEmployee({
      teamId: team.id,
      data: values,
    });
  };

  return (
    <Dialog {...props} open={open} onOpenChange={(value) => !isPending && setOpen(value)}>
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
        {trigger ?? (
          <Button variant="secondary">
            <Trans>Add Employee</Trans>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>
            <Trans>Add Employee</Trans>
          </DialogTitle>

          <DialogDescription>
            <Trans>Enter the details of the new employee.</Trans>
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
                  <Trans>Create</Trans>
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
