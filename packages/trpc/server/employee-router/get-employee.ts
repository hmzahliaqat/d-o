import { TRPCError } from '@trpc/server';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import { ZGetEmployeeRequestSchema, ZGetEmployeeResponseSchema } from './get-employee.types';

export const getEmployeeRoute = authenticatedProcedure
  .input(ZGetEmployeeRequestSchema)
  .output(ZGetEmployeeResponseSchema)
  .query(async ({ input, ctx }) => {
    const { id, teamId } = input;
    const { user } = ctx;

    ctx.logger.info({
      input: {
        id,
        teamId,
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

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        teamId,
      },
    });

    if (!employee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Employee not found',
      });
    }

    return employee;
  });
