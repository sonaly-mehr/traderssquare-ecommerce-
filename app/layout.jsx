import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/store/Providers";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "TradersSquare. - Shop smarter",
    description: "TradersSquare. - Shop smarter",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-arp="true">
            <body className={`${outfit.className} antialiased`}>
               <Providers>{children}</Providers>
            </body>
        </html>
    );
}
