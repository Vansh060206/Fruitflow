"use client";

import { WholesalerShell } from "@/components/wholesaler-shell";

export default function WholesalerLayout({ children }) {
    return (
        <WholesalerShell>
            {children}
        </WholesalerShell>
    );
}
