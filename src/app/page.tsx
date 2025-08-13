import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Online Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Conecte-se e converse com outros usuários em tempo real. Faça login
            para começar a trocar mensagens!
          </p>

          <div className="space-y-3">
            <Link href="/login">
              <button className="w-full px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-colors">
                Fazer Login
              </button>
            </Link>

            <Link href="/register">
              <button className="w-full px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 font-semibold transition-colors">
                Criar Conta
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
