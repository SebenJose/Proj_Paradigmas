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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

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
    defaultValues: { rating: 5, comment: "" },
  });

  async function onSubmit(values: ReviewFormValues) {
    setFormError(null);

    try {
      await create({ googleBooksId, ...values });
      reset({ rating: 5, comment: "" });
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
          <FieldLabel htmlFor="rating">Nota</FieldLabel>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger id="rating" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} {value === 1 ? "estrela" : "estrelas"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={errors.rating ? [errors.rating] : undefined} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">Comentário</FieldLabel>
          <Textarea id="comment" rows={3} {...register("comment")} />
          <FieldError errors={errors.comment ? [errors.comment] : undefined} />
        </Field>

        {formError && <FieldError>{formError}</FieldError>}

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </FieldGroup>
    </form>
  );
}
