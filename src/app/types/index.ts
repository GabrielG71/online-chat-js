export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    name: string;
  };
}
