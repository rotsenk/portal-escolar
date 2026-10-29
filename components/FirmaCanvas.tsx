"use client";

/**
 * FirmaCanvas — Área de firma digital táctil.
 * Permite dibujar con dedo (touch) o mouse.
 * Requisito: Req 1.3 — recuadro para firma táctil al autorizar/denegar.
 */

import { useRef, useEffect, useCallback, useState } from "react";
import { RefreshCw, PenLine } from "lucide-react";

interface FirmaCanvasProps {
  onFirmaChange: (dataUrl: string | null) => void;
  firmaBloqueada?: boolean;
}

export default function FirmaCanvas({ onFirmaChange, firmaBloqueada = false }: FirmaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dibujando = useRef(false);
  const [tieneFirma, setTieneFirma] = useState(false);

  /** Configura el canvas con alta resolución para pantallas retina */
  const configurarCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#0F172A"; // Azul marino para la firma
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    configurarCanvas();
    window.addEventListener("resize", configurarCanvas);
    return () => window.removeEventListener("resize", configurarCanvas);
  }, [configurarCanvas]);

  /** Obtiene posición relativa al canvas desde evento mouse o touch */
  const obtenerPosicion = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const iniciarDibujo = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (firmaBloqueada) return;
    e.preventDefault();
    dibujando.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = obtenerPosicion(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const dibujar = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!dibujando.current || firmaBloqueada) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = obtenerPosicion(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const terminarDibujo = () => {
    if (!dibujando.current) return;
    dibujando.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setTieneFirma(true);
    onFirmaChange(canvas.toDataURL("image/png"));
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTieneFirma(false);
    onFirmaChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <PenLine size={16} aria-hidden="true" />
          Firma digital
          <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        {!firmaBloqueada && (
          <button
            type="button"
            onClick={limpiarFirma}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Limpiar firma"
          >
            <RefreshCw size={12} aria-hidden="true" />
            Limpiar
          </button>
        )}
      </div>

      <div
        className={`relative rounded-lg border-2 ${
          firmaBloqueada
            ? "border-slate-200 bg-slate-50 cursor-not-allowed"
            : tieneFirma
            ? "border-blue-400 bg-white"
            : "border-dashed border-slate-300 bg-white"
        }`}
        style={{ height: "130px" }}
      >
        <canvas
          ref={canvasRef}
          className="signature-canvas w-full h-full rounded-lg"
          onMouseDown={iniciarDibujo}
          onMouseMove={dibujar}
          onMouseUp={terminarDibujo}
          onMouseLeave={terminarDibujo}
          onTouchStart={iniciarDibujo}
          onTouchMove={dibujar}
          onTouchEnd={terminarDibujo}
          aria-label="Área de firma digital táctil"
          role="img"
        />
        {!tieneFirma && !firmaBloqueada && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-slate-400 text-center px-4">
              Firme aquí con su dedo o mouse
            </p>
          </div>
        )}
        {firmaBloqueada && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-400">Firma registrada</p>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500">
        Dibuje su firma para confirmar la respuesta
      </p>
    </div>
  );
}
