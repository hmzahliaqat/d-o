import { router } from '../trpc';
import { createEmployeeRoute } from './create-employee';
import { deleteEmployeeRoute } from './delete-employee';
import { findEmployeesRoute } from './find-employees';
import { getEmployeeRoute } from './get-employee';
import { updateEmployeeRoute } from './update-employee';

export const employeeRouter = router({
  get: getEmployeeRoute,
  find: findEmployeesRoute,
  create: createEmployeeRoute,
  update: updateEmployeeRoute,
  delete: deleteEmployeeRoute,
});
