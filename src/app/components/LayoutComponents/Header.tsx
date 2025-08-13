import React from "react";
import { Users, Settings } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💬</span>
          <h1 className="text-xl font-bold text-white">Online Chat TS</h1>
        </div>

        <nav className="hidden md:flex space-x-6">
          <a
            href="#"
            className="text-white hover:text-blue-200 transition-colors"
          >
            Chat
          </a>
          <a
            href="#"
            className="text-white hover:text-blue-200 transition-colors flex items-center space-x-1"
          >
            <Users className="h-4 w-4" />
            <span>Usuários</span>
          </a>
        </nav>

        <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-all">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
