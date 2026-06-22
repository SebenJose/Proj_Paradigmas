import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Proj Paradigmas</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Frontend em construção. Conteúdo das features chega conforme o
        domínio da aplicação é definido.
      </p>
      <Link href="/login" className="font-medium underline">
        Ir para o login
      </Link>
    </div>
  );
}
