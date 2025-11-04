'use client';
import { Search, ShoppingCart, User, LogOut, Settings, ShoppingBag, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";

const Navbar = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [search, setSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const cartCount = useSelector(state => state.cart.total);
    const [isPlusMember, setIsPlusMember] = useState(false);

    // Check membership status when session changes
    useEffect(() => {
        const checkMembership = async () => {
            if (session?.user) {
                try {
                    const response = await fetch('/api/membership');
                    const data = await response.json();
                    setIsPlusMember(data.isPlusMember);
                    console.log('Membership status:', data.isPlusMember);
                } catch (error) {
                    console.error('Error checking membership:', error);
                }
            }
        };

        checkMembership();
    }, [session]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/shop?search=${search}`);
    }

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    //             setIsDropdownOpen(false);
    //         }
    //     };

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []);

    const handleSignOut = async () => {
        try {
            setIsDropdownOpen(false);
            await signOut({ redirect: false });
            toast.success('Signed out successfully!');
            window.location.href = '/';
        } catch (error) {
            console.error('Sign out error:', error);
            toast.success('Signed out successfully!');
            window.location.href = '/';
        }
    }

    const handleProfile = () => {
        router.push('/orders');
    }

    const handleBilling = () => {
        router.push('/manage-billing');
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">traders</span>square<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                        <Link href="/shop" className="hover:text-indigo-600 transition-colors">Shop</Link>
                        <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>

                        {/* Billing Link - Only show for Plus members */}
                        {isPlusMember && (
                            <Link href="/manage-billing" className="hover:text-indigo-600 transition-colors">
                                Billing
                            </Link>
                        )}

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input 
                                className="w-full bg-transparent outline-none placeholder-slate-600" 
                                type="text" 
                                placeholder="Search products" 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                required 
                            />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                            <ShoppingCart size={18} />
                            Cart
                            {cartCount > 0 && (
                                <span className="absolute -top-1 left-3 text-[8px] text-white bg-indigo-500 size-3.5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Profile Section */}
                        {status === "loading" ? (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : session ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    {session.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            width={32}
                                            height={32}
                                            className="rounded-full border-2 border-gray-300 hover:border-indigo-500 transition-colors"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {session.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {session.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                        
                                        <button
                                            onClick={handleProfile}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <ShoppingBag size={16} className="mr-2" />
                                            Orders
                                        </button>
                                        
                                        {/* Billing Option - Only show for Plus members */}
                                        {isPlusMember && (
                                            <button
                                                onClick={handleBilling}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <CreditCard size={16} className="mr-2" />
                                                Billing
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push('/settings');
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings size={16} className="mr-2" />
                                            Settings
                                        </button>
                                        
                                        <hr className="my-1" />
                                        
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link 
                                href="/signin" 
                                className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <div className="sm:hidden flex items-center gap-4">
                        <button 
                            onClick={() => router.push('/search')}
                            className="p-2 text-slate-600"
                        >
                            <Search size={20} />
                        </button>

                        <Link href="/cart" className="relative p-2 text-slate-600">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 text-[8px] text-white bg-indigo-500 size-3.5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {status === "loading" ? (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        ) : session ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center focus:outline-none"
                                >
                                    {session.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            width={32}
                                            height={32}
                                            className="rounded-full border-2 border-gray-300"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {session.user?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </button>

                                {/* Mobile Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {session.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                        
                                        <button
                                            onClick={handleProfile}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <ShoppingBag size={16} className="mr-2" />
                                            Orders
                                        </button>
                                        
                                        {/* Billing Option - Mobile */}
                                        {isPlusMember && (
                                            <button
                                                onClick={handleBilling}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <CreditCard size={16} className="mr-2" />
                                                Billing
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link 
                                href="/signin" 
                                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm transition text-white rounded-full"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar;