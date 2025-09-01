import { TRPCError } from '@trpc/server';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import {
  ZUpdateEmployeeRequestSchema,
  ZUpdateEmployeeResponseSchema,
} from './update-employee.types';

export const updateEmployeeRoute = authenticatedProcedure
  .input(ZUpdateEmployeeRequestSchema)
  .output(ZUpdateEmployeeResponseSchema)
  .mutation(async ({ input, ctx }) => {
    const { id, teamId, data } = input;
    const { user } = ctx;

    ctx.logger.info({
      input: {
        id,
        teamId,
        data,
      },
    });

    // Ensure the user has access to the team
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organisation: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    });

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found or user does not have access',
      });
    }

    // Check if the employee exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id,
        teamId,
      },
    });

    if (!existingEmployee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Employee not found',
      });
    }

    // Check if employee_id already exists (if it's being updated)
    if (data.employee_id && data.employee_id !== existingEmployee.employee_id) {
      const existingEmployeeId = await prisma.employee.findFirst({
        where: {
          employee_id: data.employee_id,
          teamId,
          id: {
            not: id,
          },
        },
      });

      if (existingEmployeeId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Employee ID already exists',
        });
      }
    }

    // Check if employee_email already exists (if it's being updated)
    if (data.employee_email && data.employee_email !== existingEmployee.employee_email) {
      const existingEmployeeEmail = await prisma.employee.findFirst({
        where: {
          employee_email: data.employee_email,
          id: {
            not: id,
          },
        },
      });

      if (existingEmployeeEmail) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Employee email already exists',
        });
      }
    }

    // Update the employee
    const updatedEmployee = await prisma.employee.update({
      where: {
        id,
      },
      data,
    });

    return updatedEmployee;
  });
