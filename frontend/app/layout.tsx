import type { Metadata } from "next";
import "./globals.css";
import "../styles/theme.css";

export const metadata: Metadata = {
  title: "OnlyFans",
  description: "Premium content subscription platform",
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: "OnlyFans",
    description: "Premium content subscription platform",
    images: ['/banner.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "OnlyFans",
    description: "Premium content subscription platform",
    images: ['/banner.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
