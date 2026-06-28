import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  isPrivate: z.boolean().default(false),
});

export type CreateListValues = z.infer<typeof createListSchema>;
export type CreateListInput = z.input<typeof createListSchema>;
