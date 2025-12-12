"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "@/contexts/WalletContext";
import { useState, ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    // Ensure QueryClient is created only once per client lifecycle
    const [queryClient] = useState(() => new QueryClient());

    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cm58j5nmx00vr52bsakztgq2r"}
            config={{
                loginMethods: ['email', 'wallet', 'google'],
                appearance: {
                    theme: 'light',
                    accentColor: '#00ffff',
                    logo: '/logo.png',
                },
                embeddedWallets: {
                    disableAutomaticMigration: true,
                    showWalletUIs: true,
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <WalletProvider>
                        {children}
                        <Toaster />
                        <Sonner />
                    </WalletProvider>
                </TooltipProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}
