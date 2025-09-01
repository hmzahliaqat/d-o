import { TRPCError } from '@trpc/server';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import {
  ZCreateEmployeeRequestSchema,
  ZCreateEmployeeResponseSchema,
} from './create-employee.types';

export const createEmployeeRoute = authenticatedProcedure
  .input(ZCreateEmployeeRequestSchema)
  .output(ZCreateEmployeeResponseSchema)
  .mutation(async ({ input, ctx }) => {
    const { teamId, data } = input;
    const { user } = ctx;

    ctx.logger.info({
      input: {
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

    // Check if employee_id already exists
    const existingEmployeeId = await prisma.employee.findFirst({
      where: {
        employee_id: data.employee_id,
        teamId,
      },
    });

    if (existingEmployeeId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Employee ID already exists',
      });
    }

    // Check if employee_email already exists
    const existingEmployeeEmail = await prisma.employee.findFirst({
      where: {
        employee_email: data.employee_email,
      },
    });

    if (existingEmployeeEmail) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Employee email already exists',
      });
    }

    // Create the employee
    const employee = await prisma.employee.create({
      data: {
        ...data,
        teamId,
      },
    });

    return employee;
  });
