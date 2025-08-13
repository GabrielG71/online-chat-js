"use client";

import { MessageSquare } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-gray-900 text-gray-200 py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2 hover:scale-105 transition-all duration-300 hover:text-blue-300 cursor-pointer">
            <MessageSquare className="w-6 h-6 text-blue-400 hover:text-blue-300 transition-colors duration-300" />
            <span className="text-xl font-semibold">Online Chat</span>
          </div>
        </Link>

        {session ? (
          <div className="flex items-center gap-4">
            <span>Olá, {session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 rounded hover:bg-gray-800">
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Registrar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
