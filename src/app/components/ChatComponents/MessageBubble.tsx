import { Message } from "../../types";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  formatTime: (dateString: string) => string;
}

export default function MessageBubble({
  message,
  isOwnMessage,
  formatTime,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div
          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-2xl ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
          }`}
        >
          <p className="text-sm break-words">{message.content}</p>
          <p
            className={`text-xs mt-1 ${
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
