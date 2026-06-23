import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Escolha uma nota").max(5, "A nota máxima é 5"),
  comment: z
    .string()
    .min(1, "Escreva um comentário")
    .max(1000, "Comentário muito longo (máx. 1000 caracteres)"),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
