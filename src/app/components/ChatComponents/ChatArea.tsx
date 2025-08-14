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
    <div className={`${showChat ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
      {selectedUser ? (
        <>
          <ChatHeader selectedUser={selectedUser} onBack={onBack} />
          <MessagesContainer
            messages={messages}
            currentUserId={currentUserId}
            formatTime={formatTime}
          />
          <MessageInput
            message={message}
            onMessageChange={onMessageChange}
            onSendMessage={onSendMessage}
          />
        </>
      ) : (
        <EmptyChat />
      )}
    </div>
  );
}
