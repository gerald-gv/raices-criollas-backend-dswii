import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/layout/Header";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Footer } from "./components/layout/Footer";
import { getSession } from "./lib/session";

export const metadata: Metadata = {
  title: "Raices Criollas | Cocina peruana con historia",
  description: "Sabores peruanos que nos recuerdan a casa. Reserva tu mesa en Raices Criollas."
  ,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  const headerUser = session
    ? {
      email: session.email,
      isAdmin: session.isAdmin,
    } : null

  return (
    <html lang="es"
      className="antialiased"
    >
      <body className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header user={headerUser}/>
        <main className="grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
