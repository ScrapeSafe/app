"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/contexts/WalletContext";
import { useState, ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
    // Ensure QueryClient is created only once per client lifecycle
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <WalletProvider>
                    {children}
                    <Toaster />
                    <Sonner />
                </WalletProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
