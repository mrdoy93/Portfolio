import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Rodolfo Jr. Cortez — Creator & Builder", description: "UGC video and technical projects by Rodolfo Jr. Cortez." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
