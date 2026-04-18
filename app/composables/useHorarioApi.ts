import type {
  Opcion,
  CargaAcademicaResponse,
  DisponibilidadResponse,
  GuardarHorarioPayload,
  AccionDocentePayload,
  HorasDocenteItem,
} from "~~/shared/types/horario";

export function useHorarioApi() {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase,
  });

  const getAreas = () => api<Opcion[]>("/remoto/get-areas");
  const getTurnos = () => api<Opcion[]>("/remoto/get-turnos");
  const getSedes = () =>
    api<Opcion[]>("/remoto/get-sedes", {
      query: { all: true },
    });

  const getGrupoAulas = (params: {
    area?: number | null;
    turno?: number | null;
    sede?: number | null;
  }) =>
    api<any[]>("/remoto/get-grupo-aulas", {
      query: {
        area: params.area || undefined,
        turno: params.turno || undefined,
        sede: params.sede || undefined,
      },
    });

  const getDocentes = (q?: string) =>
    api<Array<{ id: number; text: string }>>("/remoto/get-docentes", {
      query: { q: q || undefined },
    });

  const getDisponibilidad = (params: {
    docente: number;
    turno?: number | null;
  }) =>
    api<DisponibilidadResponse>("/remoto/get-disponibilidad", {
      query: {
        docente: params.docente,
        turno: params.turno || undefined,
      },
    });

  const getCargaAcademica = (grupo: number) =>
    api<CargaAcademicaResponse>("/remoto/get-carga-academica", {
      query: { grupo },
    });

  const guardarHorario = (payload: GuardarHorarioPayload) =>
    api<{ status: boolean; message: string }>("/horario", {
      method: "POST",
      body: payload,
    });

  const desmatricularDocente = (payload: AccionDocentePayload) =>
    api<{ status: boolean; message: string }>(
      "/horario/desmatricular/docente",
      {
        method: "PUT",
        body: payload,
      },
    );

  const vincularDocente = (payload: AccionDocentePayload) =>
    api<{ status: boolean; message: string }>("/horario/vincular/docente", {
      method: "PUT",
      body: payload,
    });

  const listarHorasDocentes = () =>
    api<HorasDocenteItem[]>("/remoto/horas-docentes");

  return {
    getAreas,
    getTurnos,
    getSedes,
    getGrupoAulas,
    getDocentes,
    getDisponibilidad,
    getCargaAcademica,
    guardarHorario,
    desmatricularDocente,
    vincularDocente,
    listarHorasDocentes,
  };
}
