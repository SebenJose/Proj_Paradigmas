import { z } from "zod";

export const bookSearchSchema = z.object({
  query: z.string().min(1, "Digite o nome de um livro ou autor"),
});

export type BookSearchValues = z.infer<typeof bookSearchSchema>;
