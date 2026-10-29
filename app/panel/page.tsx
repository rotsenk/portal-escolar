"use client";

/**
 * Página del Panel Escolar (Sofía / maestra).
 * Ruta: /panel
 *
 * Requiere autenticación — Req 5.4.
 */

import { useState } from "react";
import LoginPanel from "@/components/panel/LoginPanel";
import DashboardPanel from "@/components/panel/DashboardPanel";
import { UsuarioEscolar } from "@/lib/types";

export default function PaginaPanel() {
  const [usuarioActual, setUsuarioActual] = useState<UsuarioEscolar | null>(null);

  const cerrarSesion = () => {
    setUsuarioActual(null);
  };

  if (!usuarioActual) {
    return <LoginPanel onLogin={setUsuarioActual} />;
  }

  return <DashboardPanel usuario={usuarioActual} onCerrarSesion={cerrarSesion} />;
}
