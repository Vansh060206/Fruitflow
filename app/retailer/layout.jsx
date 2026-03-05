"use client";

import { CartProvider } from "@/lib/cart-context";
import { RetailerShell } from "@/components/retailer-shell";

export default function RetailerLayout({ children }) {
    return (
        <CartProvider>
            <RetailerShell>
                {children}
            </RetailerShell>
        </CartProvider>
    );
}
