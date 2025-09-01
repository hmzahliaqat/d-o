import { z } from 'zod';

export const ZEmployeeSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  employee_id: z.string(),
  employee_name: z.string(),
  employee_email: z.string().email(),
  teamId: z.number(),
});

export const ZEmployeeCreateSchema = z.object({
  employee_id: z.string(),
  employee_name: z.string(),
  employee_email: z.string().email(),
});

export const ZEmployeeUpdateSchema = z.object({
  employee_id: z.string().optional(),
  employee_name: z.string().optional(),
  employee_email: z.string().email().optional(),
});

export type TEmployee = z.infer<typeof ZEmployeeSchema>;
export type TEmployeeCreate = z.infer<typeof ZEmployeeCreateSchema>;
export type TEmployeeUpdate = z.infer<typeof ZEmployeeUpdateSchema>;
