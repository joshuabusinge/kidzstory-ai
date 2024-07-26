import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="flex flex-col min-h-screen">
          <Header />

          {children}

          {/* Toaster */}
          <Toaster duration={8000} position="bottom-left" />
        </body>
      </html>
    </ClerkProvider>
  );
}
