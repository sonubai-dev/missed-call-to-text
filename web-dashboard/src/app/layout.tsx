import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Missed Call to WhatsApp",
  description: "Automatically follow up with customers through SMS and WhatsApp when your business misses a call.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
