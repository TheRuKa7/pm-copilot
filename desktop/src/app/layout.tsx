import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pm-copilot",
  description: "LangGraph-powered PM assistant — runs locally in a Tauri shell",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
