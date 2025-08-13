import React from "react";
import { Github, Twitter, Mail } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl">💬</span>
              <h3 className="text-lg font-semibold">Online Chat TS</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Chat em tempo real construído com TypeScript
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-gray-400 text-xs">
              © 2024 Online Chat TS. Feito com ❤️ e TypeScript
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
