'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
// import { fetchAddress } from "@/lib/features/address/addressSlice";
// import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";
import { useSession } from "next-auth/react";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch()
    const {session} = useSession()

    const {cartItems} = useSelector((state)=>state.cart)

    useEffect(()=>{
        dispatch(fetchProducts({}))
    },[])

    useEffect(()=>{
        if(session?.user){
            dispatch(fetchCart({}))
            // dispatch(fetchAddress({}))
            // dispatch(fetchUserRatings({}))
        }
    },[session?.user])

    useEffect(()=>{
        if(session?.user){
            dispatch(uploadCart({}))
        }
    },[cartItems])




    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
