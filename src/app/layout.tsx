import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "../lib/utils";

import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Stakers Choice Ads – Ads Tracking Platform",
  description: "Monitor impressions, clicks, visits and actions across your ad campaigns",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full dark", "font-sans", geist.variable)} style={{ colorScheme: 'dark' }}>
      <body className="h-full">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
