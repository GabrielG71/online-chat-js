"use client";
import { Search, Send, MoreVertical } from "lucide-react";
import { useState } from "react";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const conversations = [
    {
      id: 1,
      name: "João Silva",
      lastMessage: "Oi, como você está?",
      time: "14:30",
      unread: 2,
    },
    {
      id: 2,
      name: "Maria Santos",
      lastMessage: "Obrigada!",
      time: "13:45",
      unread: 0,
    },
  ];

  const messages = [
    { id: 1, text: "Oi! Como você está?", sender: "other", time: "14:25" },
    { id: 2, text: "Estou bem, obrigado!", sender: "me", time: "14:26" },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 pt-20">
      <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Conversas
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {conv.name}
                    </h3>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="ml-3 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              João Silva
            </h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`max-w-md ${msg.sender === "me" ? "" : ""}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    msg.sender === "me"
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "me" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
