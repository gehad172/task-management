
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Providers } from "./Providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Editorial Kanban",
  description: "Curate your productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${inter.variable} min-h-screen antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}