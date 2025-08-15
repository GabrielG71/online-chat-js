import { User } from "../../types";

interface UserItemProps {
  user: User;
  onSelect: (user: User) => void;
}

export default function UserItem({ user, onSelect }: UserItemProps) {
  return (
    <div
      onClick={() => onSelect(user)}
      className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
