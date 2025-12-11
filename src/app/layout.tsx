import "./globals.css";
import { ClientProviders } from "./providers";
import { ReactNode } from "react";

export const metadata = {
    title: "ScrapeSafe",
    description: "ScrapeSafe Application",
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    );
}
