import SignIn from "@/components/auth/SignInContents";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignIn />
    </Suspense>
  );
}
