import ResetPasswordContent from "@/components/auth/ResetPasswordContent";
import { Suspense } from "react";

export default function ResetPassword() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
