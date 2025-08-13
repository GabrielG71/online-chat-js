import React from "react";
import { MessageSquare } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 text-gray-200 py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <span className="text-xl font-semibold">Online Chat</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded hover:bg-gray-800 transition">
            Login
          </button>
          <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition">
            Registrar
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
