import { useSocket } from "../context/SocketContext";

export default function ConnectionIndicator() {
  const { isConnected } = useSocket();

  return (
    <div className="fixed top-24 right-4 z-50">
      <div
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          isConnected
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-red-100 text-red-800 border border-red-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span>{isConnected ? "🔴 Ao Vivo" : "⚫ Offline"}</span>
        </div>
      </div>
    </div>
  );
}
