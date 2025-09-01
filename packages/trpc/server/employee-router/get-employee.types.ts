import { z } from 'zod';

import { ZEmployeeSchema } from './types';

export const ZGetEmployeeRequestSchema = z.object({
  id: z.number(),
  teamId: z.number(),
});

export const ZGetEmployeeResponseSchema = ZEmployeeSchema;

export type TGetEmployeeResponse = z.infer<typeof ZGetEmployeeResponseSchema>;
