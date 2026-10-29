"use client";

/**
 * PermisoCliente — Client Component completo del Portal del Padre.
 *
 * Al ser "use client" todo el árbol se hidrата en el navegador:
 * los botones "Autorizar" y "Denegar" tienen JavaScript activo
 * y responden al toque en dispositivos móviles desde el primer render.
 *
 * No hay capas con pointer-events: none ni z-index bloqueante
 * sobre los botones de acción.
 */

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AlertTriangle, Link2Off } from "lucide-react";
import VistaEvento from "@/components/padre/VistaEvento";
import {
  buscarToken,
  obtenerEstudiante,
  obtenerEvento,
  buscarAutorizacion,
} from "@/lib/store";

export default function PermisoCliente() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("id");

  const { evento, estudiante, autorizacion, error } = useMemo(() => {
    if (!tokenParam) {
      return { error: "no_token", evento: null, estudiante: null, autorizacion: null };
    }

    const tokenData = buscarToken(tokenParam);
    if (!tokenData) {
      return { error: "token_invalido", evento: null, estudiante: null, autorizacion: null };
    }

    const eventoData = obtenerEvento(tokenData.eventoId);
    if (!eventoData) {
      return { error: "evento_no_encontrado", evento: null, estudiante: null, autorizacion: null };
    }

    const estudianteData = obtenerEstudiante(tokenData.estudianteId);
    if (!estudianteData) {
      return { error: "estudiante_no_encontrado", evento: eventoData, estudiante: null, autorizacion: null };
    }

    return {
      error: null,
      evento: eventoData,
      estudiante: estudianteData,
      autorizacion: buscarAutorizacion(tokenParam),
    };
  }, [tokenParam]);

  /* ── Token inválido o ausente ─────────────────────────────────────────── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
            <div className="bg-red-100 rounded-full p-4 w-fit mx-auto">
              {error === "no_token" ? (
                <Link2Off size={32} className="text-red-600" aria-hidden="true" />
              ) : (
                <AlertTriangle size={32} className="text-red-600" aria-hidden="true" />
              )}
            </div>
            <h1 className="text-lg font-bold text-[#0F172A]">Enlace no válido</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              {error === "no_token" &&
                "Este enlace no contiene un identificador de acceso. Verifique que copió el enlace completo desde WhatsApp."}
              {error === "token_invalido" &&
                "El enlace no existe o ha expirado. Solicite un nuevo enlace a la institución educativa."}
              {(error === "evento_no_encontrado" || error === "estudiante_no_encontrado") &&
                "La información del evento no está disponible. Contacte a la institución educativa."}
            </p>
            <p className="text-xs text-slate-400">
              Si el problema persiste, comuníquese con la secretaría de la escuela.
            </p>
          </div>

          {/* Accesos de demo */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-amber-800 mb-2">Accesos de prueba:</p>
            {[
              { token: "TKN-ABC12345", desc: "Valentina — Pendiente" },
              { token: "TKN-JKL44556", desc: "Sebastián — Autorizado" },
            ].map((t) => (
              <a
                key={t.token}
                href={`/permiso?id=${t.token}`}
                className="block text-xs text-blue-700 underline"
              >
                {t.token} — {t.desc}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Vista principal del padre ─────────────────────────────────────────── */
  return (
    <VistaEvento
      evento={evento!}
      estudiante={estudiante!}
      autorizacionInicial={autorizacion}
    />
  );
}
