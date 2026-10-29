"use client";

/**
 * NavPanel — Barra de navegación superior del Panel Escolar.
 * Muestra el nombre del usuario autenticado y opción de cerrar sesión.
 */

import { GraduationCap, LogOut, User } from "lucide-react";
import { UsuarioEscolar } from "@/lib/types";

interface NavPanelProps {
  usuario: UsuarioEscolar;
  onCerrarSesion: () => void;
}

export default function NavPanel({ usuario, onCerrarSesion }: NavPanelProps) {
  return (
    <header className="bg-[#0F172A] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap size={24} className="text-blue-400" aria-hidden="true" />
          <div>
            <p className="text-xs text-slate-400 font-medium leading-none">Panel Escolar</p>
            <p className="text-base font-semibold leading-tight">Portal de Gestión</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
            <User size={15} className="text-slate-400" aria-hidden="true" />
            <span className="text-sm text-slate-200 font-medium">{usuario.nombre}</span>
            <span className="text-xs text-slate-500 capitalize">({usuario.rol})</span>
          </div>
          <button
            type="button"
            onClick={onCerrarSesion}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-red-800 text-slate-200 hover:text-white font-medium rounded-lg px-3 py-2 text-sm transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogOut size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
