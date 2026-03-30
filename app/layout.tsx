import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noscoins — L'espace qui rassemble vos plus beaux moments.",
  description:
    "Trouvez et réservez les meilleurs espaces événementiels en Europe et en Côte d'Ivoire. Mariages, séminaires, anniversaires, tournages.",
  openGraph: {
    title: "Noscoins",
    description: "L'espace qui rassemble vos plus beaux moments.",
    url: "https://noscoins.app",
    siteName: "Noscoins",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
