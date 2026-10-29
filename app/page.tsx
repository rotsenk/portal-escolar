"use client";

/**
 * Página de inicio — acceso rápido al demo del Portal Escolar.
 * Solo muestra los accesos directos, sin texto de especificación ni documentación.
 */

import Link from "next/link";
import { GraduationCap, Smartphone, LayoutDashboard, ChevronRight, ArrowRight } from "lucide-react";

const TOKENS_DEMO = [
  { token: "TKN-ABC12345", nombre: "Valentina Ramírez", estado: "Pendiente" },
  { token: "TKN-DEF67890", nombre: "Mateo González", estado: "Pendiente" },
  { token: "TKN-JKL44556", nombre: "Sebastián Castro", estado: "Autorizado" },
];

export default function PaginaInicio() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Cabecera institucional */}
      <header className="bg-[#0F172A] text-white px-4 py-5 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-3">
          <GraduationCap size={28} className="text-blue-400" aria-hidden="true" />
          <h1 className="text-xl font-bold">Portal Escolar</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-4">

        {/* ── Portal del Padre ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-xl p-2.5">
              <Smartphone size={22} className="text-blue-700" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Portal del Padre</h2>
              <p className="text-xs text-slate-500">Acceso directo por enlace de WhatsApp</p>
            </div>
          </div>

          <div className="space-y-2">
            {TOKENS_DEMO.map((t) => (
              <Link
                key={t.token}
                href={`/permiso?id=${t.token}`}
                className="flex items-center justify-between bg-slate-50 hover:bg-blue-50 active:bg-blue-100 border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-3 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{t.nombre}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{t.token}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      t.estado === "Autorizado"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {t.estado}
                  </span>
                  <ChevronRight size={16} className="text-slate-400" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Panel de la Maestra ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 rounded-xl p-2.5">
              <LayoutDashboard size={22} className="text-emerald-700" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">Panel de la Maestra</h2>
              <p className="text-xs text-slate-500">Gestión de eventos y recogidas</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg px-4 py-3 text-xs font-mono text-slate-600 border border-slate-200">
            <span className="text-slate-400">Usuario: </span>
            <strong>Sofía Vargas</strong>
            {"  "}
            <span className="text-slate-400">Clave: </span>
            <strong>escuela2026</strong>
          </div>

          <Link
            href="/panel"
            className="flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-slate-800 active:bg-slate-700 text-white font-semibold rounded-xl px-4 py-3 text-sm transition-colors"
          >
            Abrir Panel Escolar
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

      </main>
    </div>
  );
}
