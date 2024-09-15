import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zippex",
  description: "Just zippex it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_PLACES_AUTOCOMPLETE_API_KEY}&libraries=places`}
        ></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
