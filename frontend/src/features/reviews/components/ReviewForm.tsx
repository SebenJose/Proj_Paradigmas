"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { create } from "../services/review.service";
import { reviewSchema, type ReviewFormValues } from "../schemas";
import { ApiError } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import { StarRating } from "@/shared/components/StarRating";

interface ReviewFormProps {
  googleBooksId: string;
  onCreated: () => void;
}

export function ReviewForm({ googleBooksId, onCreated }: ReviewFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5.0, comment: "" },
  });

  async function onSubmit(values: ReviewFormValues) {
    setFormError(null);
    try {
      await create({ googleBooksId, ...values });
      reset({ rating: 5.0, comment: "" });
      onCreated();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Não foi possível enviar sua avaliação",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.rating}>
          <FieldLabel htmlFor="rating">Sua Avaliação</FieldLabel>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRating
                rating={field.value}
                onChange={field.onChange}
                interactive
              />
            )}
          />
          <FieldError errors={errors.rating ? [errors.rating] : undefined} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">Comentário</FieldLabel>
          <Textarea id="comment" rows={3} {...register("comment")} placeholder="Escreva sua opinião..." />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        {formError && <FieldError>{formError}</FieldError>}

        <Button type="submit" disabled={isSubmitting} className="w-full active-press hover-glow">
          {isSubmitting ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </FieldGroup>
    </form>
  );
}
