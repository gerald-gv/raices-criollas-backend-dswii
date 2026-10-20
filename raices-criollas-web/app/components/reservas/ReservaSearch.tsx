"use client";

import { Calendar, Clock, Search, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface ReservaSearchProps {
  initialFecha?: string;
  initialHoraInicio?: string;
  initialHoraFin?: string;
  initialPersonas?: number;
}

export const ReservaSearch = ({
  initialFecha = "",
  initialHoraInicio = "",
  initialHoraFin = "",
  initialPersonas = 2,
}: ReservaSearchProps) => {
  // Calculamos fecha mínima de hoy en hora local (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState(initialFecha || todayStr);
  const [horaInicio, setHoraInicio] = useState(initialHoraInicio || "19:00");
  const [horaFin, setHoraFin] = useState(initialHoraFin || "21:00");
  const [personas, setPersonas] = useState(initialPersonas || 2);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);

    if (!fecha) {
      e.preventDefault();
      setClientError("Por favor selecciona una fecha.");
      return;
    }

    if (horaInicio >= horaFin) {
      e.preventDefault();
      setClientError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    if (personas < 1) {
      e.preventDefault();
      setClientError("La cantidad de personas debe ser al menos 1.");
      return;
    }
  };

  return (
    <div className="w-full rounded-sm border border-(--line) bg-(--paper) p-6 shadow-[0_12px_36px_rgba(38,37,31,0.06)] md:p-8">
      <form action="/reservar-mesa" method="get" onSubmit={handleSubmit} role="search" className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="search-fecha" className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)">
              <Calendar size={14} className="text-(--terracotta)" aria-hidden="true" />
              Fecha
            </label>
            <input
              id="search-fecha"
              name="fecha"
              type="date"
              required
              min={todayStr}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-sm border border-(--line) bg-white px-3.5 py-2.75 text-[13px] text-(--ink) transition-colors focus:border-(--terracotta) focus-visible:outline-2 focus-visible:outline-(--terracotta)"
            />
          </div>

          {/* Hora Inicio */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="search-hora-inicio" className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)">
              <Clock size={14} className="text-(--terracotta)" aria-hidden="true" />
              Hora inicio
            </label>
            <input
              id="search-hora-inicio"
              name="horaInicio"
              type="time"
              required
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full rounded-sm border border-(--line) bg-white px-3.5 py-2.75 text-[13px] text-(--ink) transition-colors focus:border-(--terracotta) focus-visible:outline-2 focus-visible:outline-(--terracotta)"
            />
          </div>

          {/* Hora Fin */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="search-hora-fin" className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)">
              <Clock size={14} className="text-(--terracotta)" aria-hidden="true" />
              Hora fin
            </label>
            <input
              id="search-hora-fin"
              name="horaFin"
              type="time"
              required
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full rounded-sm border border-(--line) bg-white px-3.5 py-2.75 text-[13px] text-(--ink) transition-colors focus:border-(--terracotta) focus-visible:outline-2 focus-visible:outline-(--terracotta)"
            />
          </div>

          {/* Cantidad de personas */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="search-personas" className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-(--muted)">
              <Users size={14} className="text-(--terracotta)" aria-hidden="true" />
              Comensales
            </label>
            <input
              id="search-personas"
              name="personas"
              type="number"
              min={1}
              max={30}
              required
              value={personas}
              onChange={(e) => setPersonas(Number(e.target.value))}
              className="w-full rounded-sm border border-(--line) bg-white px-3.5 py-2.75 text-[13px] text-(--ink) transition-colors focus:border-(--terracotta) focus-visible:outline-2 focus-visible:outline-(--terracotta)"
            />
          </div>
        </div>

        {clientError && (
          <p role="alert" className="text-[12px] font-bold text-(--terracotta)">
            {clientError}
          </p>
        )}

        <div className="flex items-center justify-end">
          <Button type="submit" variant="primary" className="w-full sm:w-auto">
            <Search size={16} aria-hidden="true" />
            Buscar mesas disponibles
          </Button>
        </div>
      </form>
    </div>
  );
};
