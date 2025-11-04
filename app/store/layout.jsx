import SignIn from "@/components/auth/SignInContents";
import StoreLayout from "@/components/store/StoreLayout";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export const metadata = {
    title: "TradersSquare. - Store Dashboard",
    description: "TradersSquare. - Store Dashboard",
};

export default async function RootAdminLayout({ children }) {
const session = await getServerSession(authOptions);
    
    // If no session (signed out), show the signin page
    if (!session) {
        return <SignIn />;
    }


    // User is authenticated AND is admin - show admin layout
    return (
        <StoreLayout>
            {children}
        </StoreLayout>
    );
}
