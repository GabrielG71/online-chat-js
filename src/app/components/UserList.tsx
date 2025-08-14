import { User } from "../types";
import UserItem from "./UserItem";

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

export default function UserList({ users, onUserSelect }: UserListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          onSelect={onUserSelect}
        />
      ))}
    </div>
  );
}
