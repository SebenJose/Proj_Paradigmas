"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookSearchSchema, type BookSearchValues } from "../schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldError } from "@/shared/components/ui/field";

interface BookSearchFormProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export function BookSearchForm({ onSearch, isSearching }: BookSearchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookSearchValues>({
    resolver: zodResolver(bookSearchSchema),
    defaultValues: { query: "" },
  });

  function onSubmit(values: BookSearchValues) {
    onSearch(values.query);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex items-start gap-2">
      <Field data-invalid={!!errors.query} className="flex-1">
        <Input
          placeholder="Busque por título, autor..."
          aria-label="Buscar livros"
          {...register("query")}
        />
        <FieldError errors={errors.query ? [errors.query] : undefined} />
      </Field>

      <Button type="submit" disabled={isSearching}>
        {isSearching ? "Buscando..." : "Buscar"}
      </Button>
    </form>
  );
}
