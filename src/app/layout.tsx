import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/context";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { SnapshotProvider } from "@/context/SnapshotContext";
import "@fortawesome/fontawesome-svg-core/styles.css"; //Import Font Awesome CSS
import "../lib/FontAwesome"; // Import your Font Awesome config

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
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ReactQueryProvider>
            <SnapshotProvider>{children}</SnapshotProvider>
          </ReactQueryProvider>
        </AuthProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
