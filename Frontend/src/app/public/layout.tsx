
"use client"

import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";

export default function BookServiceLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            <div>
                {children}
            </div>
            <Footer />
        </>
    );
}