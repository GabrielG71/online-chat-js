interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

export default function ConnectionStatus({
  isConnected,
  error,
}: ConnectionStatusProps) {
  if (isConnected && !error) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Conectado em tempo real</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span>Conexão perdida - tentando reconectar...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs">
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
      <span>Conectando...</span>
    </div>
  );
}
