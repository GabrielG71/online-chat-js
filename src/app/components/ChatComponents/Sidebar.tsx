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
        showChat ? "hidden" : "flex"
      } md:flex w-full md:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}
    >
      <UserSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
      <UserList users={filteredUsers} onUserSelect={onUserSelect} />
    </div>
  );
}
