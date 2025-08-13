import Header from "./components/LayoutComponents/Header";
import Footer from "./components/LayoutComponents/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-semibold mb-4">Bem-vindo ao Chat!</h2>
        <div className="w-full max-w-md bg-white border rounded shadow p-4">
          <div className="h-64 overflow-y-auto border-b mb-4 p-2">
            <p className="text-gray-500 text-sm">Nenhuma mensagem ainda...</p>
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 border p-2 rounded-l"
            />
            <button className="bg-blue-600 text-white px-4 rounded-r">
              Enviar
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
