interface TypingIndicatorProps {
  isTyping: boolean;
  userName: string;
}

export default function TypingIndicator({
  isTyping,
  userName,
}: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center space-x-2 p-3 text-gray-500 dark:text-gray-400">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      <span className="text-sm italic">{userName} está digitando...</span>
    </div>
  );
}
