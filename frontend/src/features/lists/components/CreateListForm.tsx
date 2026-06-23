"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { create } from "../services/list.service";
import { createListSchema, type CreateListValues } from "../schemas";
import { ApiError } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldError } from "@/shared/components/ui/field";
import type { BookList } from "../types";

interface CreateListFormProps {
  onCreated: (list: BookList) => void;
}

export function CreateListForm({ onCreated }: CreateListFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateListValues>({
    resolver: zodResolver(createListSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateListValues) {
    setFormError(null);

    try {
      const list = await create(values);
      reset({ name: "" });
      onCreated(list);
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Não foi possível criar a lista",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex items-start gap-2">
      <Field data-invalid={!!errors.name} className="flex-1">
        <Input placeholder="Nome da lista (ex: Quero ler)" {...register("name")} />
        <FieldError errors={errors.name ? [errors.name] : undefined} />
        {formError && <FieldError>{formError}</FieldError>}
      </Field>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Criando..." : "Nova lista"}
      </Button>
    </form>
  );
}
