import { z } from 'zod';

import { ZEmployeeCreateSchema, ZEmployeeSchema } from './types';

export const ZCreateEmployeeRequestSchema = z.object({
  teamId: z.number(),
  data: ZEmployeeCreateSchema,
});

export const ZCreateEmployeeResponseSchema = ZEmployeeSchema;

export type TCreateEmployeeResponse = z.infer<typeof ZCreateEmployeeResponseSchema>;
