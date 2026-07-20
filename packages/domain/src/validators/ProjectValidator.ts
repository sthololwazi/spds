import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  client: z.string().min(1),
  site: z.string().min(1),
  revision: z.string().min(1),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean()])).optional()
});

export type ProjectInput = z.input<typeof ProjectSchema>;
