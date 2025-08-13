"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (!res?.error) {
      router.push("/");
      router.refresh();
    } else {
      alert("Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Bem-vindo
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Entre na sua conta
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>
          </div>

          <button className="w-full mt-8 px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-semibold focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
