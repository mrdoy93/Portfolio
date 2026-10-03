import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Rodolfo Jr. Cortez — Creator & Builder", description: "UGC video and technical projects by Rodolfo Jr. Cortez." };

const themeScript = `(function(){try{var theme=localStorage.getItem("portfolio-theme")==="light"?"light":"dark";document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(error){document.documentElement.dataset.theme="dark"}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}