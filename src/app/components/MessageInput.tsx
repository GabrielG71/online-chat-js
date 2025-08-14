import { Send } from "lucide-react";

interface MessageInputProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export default function MessageInput({ message, onMessageChange, onSendMessage }: MessageInputProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
      <form
        onSubmit={onSendMessage}
        className="flex items-center space-x-2 sm:space-x-3"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
}
