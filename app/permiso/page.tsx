/**
 * /permiso — Página del Portal del Padre
 *
 * Shell de servidor mínimo. Todo el contenido interactivo (botones
 * Autorizar / Denegar, firma, comprobante) vive en PermisoCliente,
 * que es un Client Component hidratado completamente en el navegador.
 *
 * El <Suspense> es requerido por Next.js 16 cuando useSearchParams()
 * se usa dentro de un Client Component durante el build estático.
 */

import { Suspense } from "react";
import PermisoCliente from "./PermisoCliente";

export default function PaginaPermiso() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-9 w-9 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-500">Cargando...</p>
          </div>
        </div>
      }
    >
      <PermisoCliente />
    </Suspense>
  );
}
