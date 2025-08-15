import { User } from "../../types";
import UserSearch from "../ChatComponents/UserSearch";
import UserList from "./UserList";

interface SidebarProps {
  showChat: boolean;
  users: User[];
  searchTerm: string;
  filteredUsers: User[];
  onSearchChange: (value: string) => void;
  onUserSelect: (user: User) => void;
}

export default function Sidebar({
  showChat,
  users,
  searchTerm,
  filteredUsers,
  onSearchChange,
  onUserSelect,
}: SidebarProps) {
  return (
    <div
      className={`${
        showChat ? "hidden md:flex" : "flex"
      } w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col flex-shrink-0`}
    >
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <UserSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      </div>
      <div className="flex-1 overflow-hidden">
        <UserList users={filteredUsers} onUserSelect={onUserSelect} />
      </div>
    </div>
  );
}
