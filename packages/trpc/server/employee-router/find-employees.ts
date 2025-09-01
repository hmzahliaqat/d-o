import { prisma } from '@documenso/prisma';

import { authenticatedProcedure } from '../trpc';
import {
  ZFindEmployeesRequestSchema,
  ZFindEmployeesResponseSchema,
} from './find-employees.types';

export const findEmployeesRoute = authenticatedProcedure
  .input(ZFindEmployeesRequestSchema)
  .output(ZFindEmployeesResponseSchema)
  .query(async ({ input, ctx }) => {
    const { teamId, query, page = 1, perPage = 10 } = input;
    const { user } = ctx;

    ctx.logger.info({
      input: {
        teamId,
        query,
        page,
        perPage,
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
      throw new Error('Team not found or user does not have access');
    }

    const where = {
      teamId,
      ...(query
        ? {
            OR: [
              {
                employee_id: {
                  contains: query,
                  mode: 'insensitive' as const,
                },
              },
              {
                employee_name: {
                  contains: query,
                  mode: 'insensitive' as const,
                },
              },
              {
                employee_email: {
                  contains: query,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [data, totalCount] = await Promise.all([
      prisma.employee.findMany({
        where,
        take: perPage,
        skip: (page - 1) * perPage,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.employee.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    return {
      data,
      count: totalCount,
      totalPages,
      perPage,
      currentPage: page,
    };
  });
