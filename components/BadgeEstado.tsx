"use client";

/**
 * BadgeEstado — Indicador visual de estado de autorización.
 * Implementa los tokens de color del brand-design.
 */

import { CheckCircle, Clock, XCircle, MinusCircle } from "lucide-react";
import { EstadoAutorizacion } from "@/lib/types";

interface BadgeEstadoProps {
  estado: EstadoAutorizacion;
  tamano?: "sm" | "md";
}

const CONFIG: Record<
  EstadoAutorizacion,
  { label: string; icon: React.ElementType; clases: string }
> = {
  autorizado: {
    label: "Autorizado",
    icon: CheckCircle,
    // Verde bosque: bg-emerald-100 text-emerald-800 (WCAG AAA)
    clases: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  },
  pendiente: {
    label: "Pendiente",
    icon: Clock,
    // Naranja ocre
    clases: "bg-orange-100 text-orange-800 border border-orange-300",
  },
  denegado: {
    label: "Denegado",
    icon: XCircle,
    clases: "bg-red-100 text-red-800 border border-red-300",
  },
  sin_respuesta: {
    label: "Sin respuesta",
    icon: MinusCircle,
    clases: "bg-slate-100 text-slate-600 border border-slate-300",
  },
};

export default function BadgeEstado({ estado, tamano = "md" }: BadgeEstadoProps) {
  const { label, icon: Icon, clases } = CONFIG[estado];
  const tamanoPadding = tamano === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${tamanoPadding} ${clases}`}
      aria-label={`Estado: ${label}`}
    >
      <Icon size={tamano === "sm" ? 12 : 14} aria-hidden="true" />
      {label}
    </span>
  );
}
