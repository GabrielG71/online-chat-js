"use client";
import { SessionProvider } from "next-auth/react";

interface ClientSessionProviderProps {
  children: React.ReactNode;
  session?: any;
}

export default function ClientSessionProvider({
  children,
  session,
}: ClientSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
