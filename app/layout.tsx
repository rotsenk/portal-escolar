import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Escolar — Autorizaciones y Recogidas",
  description:
    "Sistema ligero para gestionar autorizaciones de eventos escolares y control de recogidas. Sin instalación ni cuenta requerida para los padres.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
