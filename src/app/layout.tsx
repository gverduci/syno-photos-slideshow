import type { Metadata } from "next";
import packageMetadata from '../../package.json';
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ weight: '900', subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Syno Photos Slideshow - ${packageMetadata.version}`,
  description: "Simple slideshow for Synology Photos",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className} style={{background: "black"}}>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
