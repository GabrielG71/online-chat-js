"use client";
import { MessageSquare, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-gray-200 py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2 hover:scale-105 transition-all duration-300 hover:text-blue-300 cursor-pointer">
            <MessageSquare className="w-6 h-6 text-blue-400 hover:text-blue-300 transition-colors duration-300" />
            <span className="text-xl font-semibold">Online Chat</span>
          </div>
        </Link>

        <div className="hidden md:flex">
          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Chat
              </Link>
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
              <Link
                href="/login"
                className="px-4 py-2 rounded hover:bg-gray-800"
              >
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

        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded hover:bg-gray-800 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-700">
          {session ? (
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/chat"
                className="mx-2 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Chat
              </Link>
              <span className="px-2">Olá, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="mx-2 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition text-left"
              >
                Sair
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/login"
                className="mx-2 px-4 py-2 rounded hover:bg-gray-800 transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="mx-2 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                onClick={() => setIsOpen(false)}
              >
                Registrar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
