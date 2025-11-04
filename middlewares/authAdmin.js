import prisma from "@/lib/prisma";

const authAdmin = async (userId) => {
    try {
        if (!userId) return false;

        // Get user from database using Prisma (NextAuth)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (!user) return false;

        // Check if user email is in admin list
        const adminEmails = process.env.ADMIN_EMAIL?.split(',') || [];
        return adminEmails.includes(user.email);
    } catch (error) {
        console.error("Admin auth error:", error);
        return false;
    }
}

export default authAdmin;