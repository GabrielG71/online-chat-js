import { Message } from "../types";
import MessageBubble from "./MessageBubble";
import EmptyMessages from "./EmptyMessages";

interface MessagesContainerProps {
  messages: Message[];
  currentUserId: string | undefined;
  formatTime: (dateString: string) => string;
}

export default function MessagesContainer({ messages, currentUserId, formatTime }: MessagesContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
      {messages.length > 0 ? (
        messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === currentUserId}
            formatTime={formatTime}
          />
        ))
      ) : (
        <EmptyMessages />
      )}
    </div>
  );
}
