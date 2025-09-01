import { z } from 'zod';

import { ZEmployeeSchema, ZEmployeeUpdateSchema } from './types';

export const ZUpdateEmployeeRequestSchema = z.object({
  id: z.number(),
  teamId: z.number(),
  data: ZEmployeeUpdateSchema,
});

export const ZUpdateEmployeeResponseSchema = ZEmployeeSchema;

export type TUpdateEmployeeResponse = z.infer<typeof ZUpdateEmployeeResponseSchema>;
