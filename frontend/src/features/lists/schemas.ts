import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

export type CreateListValues = z.infer<typeof createListSchema>;
