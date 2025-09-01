import { useEffect, useState } from 'react';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import type { TEmployee } from '@documenso/trpc/server/employee-router/types';
import { trpc } from '@documenso/trpc/react';

import { MultiSelectCombobox } from '../../primitives/multi-select-combobox';

export type EmployeeSelectorProps = {
  teamId: number;
  onSelect: (employee: TEmployee | null) => void;
  className?: string;
};

export const EmployeeSelector = ({ teamId, onSelect, className }: EmployeeSelectorProps) => {
  const { _ } = useLingui();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  // Fetch employees from the API
  const { data, isLoading } = trpc.employee.find.useQuery(
    {
      teamId,
      perPage: 100, // Fetch a large number of employees to avoid pagination
    },
    {
      enabled: !!teamId,
    },
  );

  const employees = data?.data || [];

  // Convert employees to options for the combobox
  const employeeOptions = employees.map((employee) => ({
    label: `${employee.employee_name} (${employee.employee_email})`,
    value: employee.id,
  }));

  // When the selected employee changes, call the onSelect callback
  useEffect(() => {
    if (selectedEmployeeId === null) {
      onSelect(null);
      return;
    }

    const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId);

    if (selectedEmployee) {
      onSelect(selectedEmployee);
    }
  }, [selectedEmployeeId, employees, onSelect]);

  return (
    <MultiSelectCombobox
      className={className}
      emptySelectionPlaceholder={_(msg`Select an employee...`)}
      loading={isLoading}
      options={employeeOptions}
      selectedValues={selectedEmployeeId ? [selectedEmployeeId] : []}
      onChange={(values) => {
        // Since we're using a multi-select component for single selection,
        // we take the last selected value (if any)
        const lastValue = values.length > 0 ? values[values.length - 1] : null;
        setSelectedEmployeeId(lastValue as number | null);
      }}
    />
  );
};
