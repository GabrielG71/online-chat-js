"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { User } from "../types";
import { useChatData } from "../hooks/useChatData";
import { formatTime } from "../utils";
import LoadingScreen from "../components/ChatComponents/LoadingScreen";
import Sidebar from "../components/ChatComponents/Sidebar";
import ChatArea from "../components/ChatComponents/ChatArea";

export default function ChatPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChat, setShowChat] = useState(false);

  const {
    users,
    messages,
    selectedUser,
    loading,
    setSelectedUser,
    sendMessage,
  } = useChatData(session);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    const success = await sendMessage(message, selectedUser.id);
    if (success) {
      setMessage("");
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowChat(true);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 pt-20 pb-24">
      {/* Adicionado pb-24 para dar espaço ao footer fixo */}
      <Sidebar
        showChat={showChat}
        users={users}
        searchTerm={searchTerm}
        filteredUsers={filteredUsers}
        onSearchChange={setSearchTerm}
        onUserSelect={handleSelectUser}
      />
      <ChatArea
        showChat={showChat}
        selectedUser={selectedUser}
        messages={messages}
        message={message}
        currentUserId={session?.user?.id}
        onBack={() => setShowChat(false)}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        formatTime={formatTime}
      />
    </div>
  );
}
