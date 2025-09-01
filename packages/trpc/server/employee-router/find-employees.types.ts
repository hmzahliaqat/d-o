import { z } from 'zod';

import { ZFindResultResponse, ZFindSearchParamsSchema } from '@documenso/lib/types/search-params';

import { ZEmployeeSchema } from './types';

export const ZFindEmployeesRequestSchema = ZFindSearchParamsSchema.extend({
  teamId: z.number(),
});

export const ZFindEmployeesResponseSchema = ZFindResultResponse.extend({
  data: ZEmployeeSchema.array(),
});

export type TFindEmployeesResponse = z.infer<typeof ZFindEmployeesResponseSchema>;
