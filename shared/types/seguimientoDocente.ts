export type GuardarSeguimientoPayload = {
  fecha: string;
  legacy_docente_id?: number | null;
  legacy_turno_id?: number | null;
  legacy_carga_academica_id?: number | null;
  legacy_horario_id?: number | null;
  legacy_plantilla_horario_id?: number | null;
  legacy_grupo_aula_id?: number | null;
  legacy_curso_id?: number | null;
  docente_nombre?: string;
  curso_nombre?: string;
  grupo_nombre?: string;
  sede_nombre?: string;
  dia?: number;
  hora_inicio?: string;
  hora_fin?: string;
  tipo?: string;
  observacion: string;
  accion_tomada?: string;
  estado?: string;
  registrado_por?: number | null;
  legacy_auth_id: number;
};

export type ObservacionItem = GuardarSeguimientoPayload & {
  id: number;
  created_at: string;
  updated_at: string;
};

export type ListarObservacionesResponse = {
  success: boolean;
  message?: string;
  data: ObservacionItem[];
};

export interface LaravelPagination<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}
