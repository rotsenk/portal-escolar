"use client";

/**
 * LoginPanel — Pantalla de autenticación del Personal Escolar.
 * Requisito: Req 5.4 — autenticación requerida antes de mostrar datos.
 */

import { useState } from "react";
import { GraduationCap, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { USUARIOS_ESCOLARES } from "@/lib/store";
import { UsuarioEscolar } from "@/lib/types";

interface LoginPanelProps {
  onLogin: (usuario: UsuarioEscolar) => void;
}

export default function LoginPanel({ onLogin }: LoginPanelProps) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    // Simular latencia de red
    await new Promise((r) => setTimeout(r, 600));

    const found = USUARIOS_ESCOLARES.find(
      (u) => u.nombre.toLowerCase() === usuario.toLowerCase().trim() &&
             u.contrasena === contrasena
    );

    setCargando(false);

    if (found) {
      onLogin(found);
    } else {
      setError("Credenciales incorrectas. Verifique su nombre de usuario y contraseña.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo institucional */}
        <div className="text-center">
          <div className="bg-[#0F172A] rounded-2xl p-5 w-fit mx-auto mb-4 shadow-lg">
            <GraduationCap size={40} className="text-blue-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Panel Escolar</h1>
          <p className="text-sm text-slate-500 mt-1">Acceso exclusivo para personal docente</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Campo: usuario */}
            <div>
              <label
                htmlFor="login-usuario"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Nombre de usuario
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User size={17} className="text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="login-usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingrese su nombre"
                  className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
                  autoComplete="username"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            {/* Campo: contraseña */}
            <div>
              <label
                htmlFor="login-contrasena"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock size={17} className="text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="login-contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full pl-10 pr-12 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarContrasena ? (
                    <EyeOff size={17} aria-hidden="true" />
                  ) : (
                    <Eye size={17} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando || !usuario.trim() || !contrasena}
              className="btn-touch w-full flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-semibold rounded-lg px-6 py-4 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              aria-label="Iniciar sesión en el panel escolar"
            >
              {cargando ? (
                <>
                  <span
                    className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    aria-hidden="true"
                  />
                  Verificando...
                </>
              ) : (
                <>
                  <Lock size={18} aria-hidden="true" />
                  Ingresar al panel
                </>
              )}
            </button>
          </form>

          {/* Credenciales de prueba */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            <p className="text-xs font-semibold text-slate-500 mb-2">DEMO — Credenciales:</p>
            <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-xs text-slate-600 font-mono">
              <p>Usuario: <strong>Sofía Vargas</strong> | Clave: <strong>escuela2026</strong></p>
              <p>Usuario: <strong>Admin Principal</strong> | Clave: <strong>admin2026</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
