"use client";

/**
 * CodigoQR — Genera y muestra un código QR usando la librería qrcode.
 * Requisito: Req 3.2 — mostrar código QR legible en la pantalla.
 */

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface CodigoQRProps {
  valor: string;
  tamano?: number;
}

export default function CodigoQR({ valor, tamano = 180 }: CodigoQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !valor) return;

    QRCode.toCanvas(canvas, valor, {
      width: tamano,
      margin: 2,
      color: {
        dark: "#0F172A",  // Azul marino del brand
        light: "#FFFFFF",
      },
    }).catch((err) => {
      console.error("Error al generar QR:", err);
    });
  }, [valor, tamano]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        className="rounded-lg border border-slate-200 shadow-sm"
        aria-label={`Código QR para comprobante ${valor}`}
        role="img"
      />
      <p className="text-xs text-slate-500 text-center">
        Escanee este código en la escuela
      </p>
    </div>
  );
}
