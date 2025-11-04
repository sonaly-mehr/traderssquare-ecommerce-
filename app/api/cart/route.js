import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";


// Update user cart 
export async function POST(request){
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { cart } = await request.json();

        // Save the cart to the user object
        await prisma.user.update({
            where: {id: userId},
            data: {cart: cart}
        })

        return NextResponse.json({ message: 'Cart updated' })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

// Get user cart 
export async function GET(request){
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;
        
        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        return NextResponse.json({ cart: user.cart })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}