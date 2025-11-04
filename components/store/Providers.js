"use client";

import StoreProvider from "@/app/StoreProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <Toaster />
        {children}
      </StoreProvider>
    </SessionProvider>
  );
}
