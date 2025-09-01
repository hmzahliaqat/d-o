import { z } from 'zod';

export const ZDeleteEmployeeRequestSchema = z.object({
  id: z.number(),
  teamId: z.number(),
});

export const ZDeleteEmployeeResponseSchema = z.object({
  success: z.boolean(),
});

export type TDeleteEmployeeResponse = z.infer<typeof ZDeleteEmployeeResponseSchema>;
