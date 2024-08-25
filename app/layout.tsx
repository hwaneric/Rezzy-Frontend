import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Rezzy: Reservations made easy",
  description: "The easiest way to get tough reservations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <Header />
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
