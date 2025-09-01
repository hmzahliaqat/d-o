import { findDocumentAuditLogs } from '@documenso/lib/server-only/document/find-document-audit-logs';

import { authenticatedProcedure } from '../trpc';
import {
  ZFindDocumentAuditLogsRequestSchema,
  ZFindDocumentAuditLogsResponseSchema,
} from './find-document-audit-logs.types';

export const findDocumentAuditLogsRoute = authenticatedProcedure
  .input(ZFindDocumentAuditLogsRequestSchema)
  .output(ZFindDocumentAuditLogsResponseSchema)
  .query(async ({ input, ctx }) => {
    // Use teamId from input if provided, otherwise fall back to context
    const contextTeamId = ctx.teamId;

    const {
      page,
      perPage,
      documentId,
      teamId: inputTeamId,
      cursor,
      filterForRecentActivity,
      orderByColumn,
      orderByDirection,
    } = input;

    // Prefer teamId from input over context
    const teamId = inputTeamId ?? contextTeamId;

    ctx.logger.info({
      input: {
        documentId,
        teamId,
      },
    });

    return await findDocumentAuditLogs({
      userId: ctx.user.id,
      teamId,
      page,
      perPage,
      documentId,
      cursor,
      filterForRecentActivity,
      orderBy: orderByColumn ? { column: orderByColumn, direction: orderByDirection } : undefined,
    });
  });
