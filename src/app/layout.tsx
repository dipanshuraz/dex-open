import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/components/QueryProvider";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Web3 Dashboard",
  description: "Real-time DEX analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased h-screen overflow-hidden text-white"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="dark">
            <QueryProvider>
              <div className="flex flex-col h-screen overflow-hidden bg-[#09001A]">
                <Header />
                <main className="flex-1 min-h-0 pt-(--navbar-height) pb-14 text-white overflow-hidden">
                  {children}
                </main>
                <Footer />
              </div>
            </QueryProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
