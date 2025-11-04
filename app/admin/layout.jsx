import AdminLayout from "@/components/admin/AdminLayout";
import { authOptions } from "@/lib/auth";
import authAdmin from "@/middlewares/authAdmin";
import { getServerSession } from "next-auth";
import SignIn from "../(public)/(auth)/signin/page";

export const metadata = {
    title: "TradersSquare - Admin",
    description: "TradersSquare - Admin Dashboard",
};

export default async function RootAdminLayout({ children }) {
    // Get the user session using NextAuth
    const session = await getServerSession(authOptions);
    
    // If no session (signed out), show the signin page
    if (!session) {
        return <SignIn />;
    }

    // Check if the logged-in user is an admin
    const isAdmin = await authAdmin(session.user.id);
    
    // If user is not admin, show access denied
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
                    <a 
                        href="/"
                        className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    // User is authenticated AND is admin - show admin layout
    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}