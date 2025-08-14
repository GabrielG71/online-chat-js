import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 text-gray-200 py-4">
      <div className="container mx-auto text-center">
        <p className="text-lg font-semibold">
          © 2025 Online Chat TS — Feito com{" "}
          <span className="text-red-500">❤️</span> e TypeScript
        </p>
        <p className="text-sm text-gray-400">Por Gabriel Gonçalves</p>
      </div>
    </footer>
  );
};

export default Footer;
