"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../services/auth.service";
import { loginSchema, type LoginCredentials } from "../schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { KeyRound, LogIn, User } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginCredentials) {
    setFormError(null);

    try {
      await login(values);
      router.push("/dashboard");
    } catch {
      setFormError("Usuário ou senha inválidos");
    }
  }

  return (
    <Card className="w-full max-w-sm border-border/40 shadow-2xl bg-card/80 backdrop-blur-xl transition-all duration-500 hover:shadow-primary/10">
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-serif">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-sm">Acesse sua biblioteca pessoal</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="space-y-5">
            <Field data-invalid={!!errors.username}>
              <FieldLabel htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Usuário
              </FieldLabel>
              <Input
                id="username"
                autoComplete="username"
                className="bg-background/50 border-border/50 focus-visible:ring-primary/30"
                {...register("username")}
              />
              <FieldError errors={errors.username ? [errors.username] : undefined} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                Senha
              </FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="bg-background/50 border-border/50 focus-visible:ring-primary/30"
                {...register("password")}
              />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            {formError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20 text-center">
                {formError}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full mt-2 group relative overflow-hidden transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                {isSubmitting ? "Entrando..." : "Acessar Acervo"}
              </span>
            </Button>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Ainda não possui um registro?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
                Criar conta
              </Link>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
