import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
    title: "FruitFlow - Fruit Management System",
    description: "Wholesaler & Retailer Management Platform",
    generator: "v0.app",
    icons: {
        icon: [
            {
                url: "/icon-light-32x32.png",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/icon-dark-32x32.png",
                media: "(prefers-color-scheme: dark)",
            },
            {
                url: "/icon.svg",
                type: "image/svg+xml",
            },
        ],
        apple: "/apple-icon.png",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`font-sans antialiased`}>
                <LanguageProvider>
                    <ThemeProvider defaultTheme="dark" storageKey="fruitflow-theme">
                        <AuthProvider>
                            {children}
                            <Toaster richColors position="top-right" />
                        </AuthProvider>
                    </ThemeProvider>
                </LanguageProvider>
                <Analytics />
            </body>
        </html>
    );
}
