import { TRPCError } from '@trpc/server';

import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import {
  ZDeleteEmployeeRequestSchema,
  ZDeleteEmployeeResponseSchema,
} from './delete-employee.types';

export const deleteEmployeeRoute = authenticatedProcedure
  .input(ZDeleteEmployeeRequestSchema)
  .output(ZDeleteEmployeeResponseSchema)
  .mutation(async ({ input, ctx }) => {
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

    // Delete the employee
    await prisma.employee.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  });
