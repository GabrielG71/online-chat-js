import { User, Message } from "../../types";
import ChatHeader from "./ChatHeader";
import MessagesContainer from "./MessagesContainer";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";

interface ChatAreaProps {
  showChat: boolean;
  selectedUser: User | null;
  messages: Message[];
  message: string;
  currentUserId: string | undefined;
  onBack: () => void;
  onMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  formatTime: (dateString: string) => string;
}

export default function ChatArea({
  showChat,
  selectedUser,
  messages,
  message,
  currentUserId,
  onBack,
  onMessageChange,
  onSendMessage,
  formatTime,
}: ChatAreaProps) {
  return (
    <div
      className={`${
        showChat ? "flex" : "hidden md:flex"
      } flex-1 flex-col min-w-0 bg-white dark:bg-gray-900`}
    >
      {selectedUser ? (
        <>
          <ChatHeader selectedUser={selectedUser} onBack={onBack} />
          <div className="flex-1 min-h-0 overflow-hidden">
            <MessagesContainer
              messages={messages}
              currentUserId={currentUserId}
              formatTime={formatTime}
            />
          </div>
          <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <MessageInput
              message={message}
              onMessageChange={onMessageChange}
              onSendMessage={onSendMessage}
            />
          </div>
        </>
      ) : (
        <EmptyChat />
      )}
    </div>
  );
}
