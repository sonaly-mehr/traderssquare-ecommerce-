import VerifyEmailClient from "@/components/auth/VerifyEmailClient";
import React, { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
