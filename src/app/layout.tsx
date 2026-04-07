import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "VocabQuest - Learn. Play. Master.",
  description: "Making vocabulary learning fun and engaging!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
