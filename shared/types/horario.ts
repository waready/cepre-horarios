export type Opcion = {
  id: number
  denominacion?: string
  text?: string
  grupo?: {
    denominacion: string
  }
}

export type Curso = {
  id: number
  denominacion: string
  color?: string
}

export type Docente = {
  id: number
  paterno?: string
  materno?: string
  nombres?: string
}

export type Carga = {
  id: number
  tipo: string | number
  estado: string | number
  usuario?: string | null
  curso: Curso 
  docente?: Docente | null
}

export type HorarioItem = {
  id: number
  dia: string | number
  grupo?: string
  sede?: string
  curso?: Curso
  carga_academicas_id?: number
  plantilla_horarios_id?: number
  carga?: Carga
}

export type HorarioBloque = {
  id?: number
  hora_inicio: string
  hora_fin: string
  tipo?: string
  horario: HorarioItem[]
}

export type HorarioTurno = {
  id: number
  turno: string
  disponibilidad: HorarioBloque[]
}

export type DisponibilidadItem = {
  id: number
  dia: string | number
  sede?: {
    denominacion?: string
  }
}

export type DisponibilidadBloque = {
  id?: number
  hora_inicio: string
  hora_fin: string
  disponibilidad: DisponibilidadItem[]
}

export type DisponibilidadTurno = {
  id: number
  turno: string
  disponibilidad: DisponibilidadBloque[]
}

export type DisponibilidadCursos = {
  id: number
  area: string
  cursos: Array<{ denominacion: string }>
}

export type DisponibilidadObservaciones = {
  total: number
  pendiente: number
  atendido: number
  cerrado: number
  otros: Record<string, number>
}

export type CargaAcademicaResponse = {
  cargaAcademica: Carga[]
  horario: HorarioBloque[]
  turno: {
    id: number
    denominacion: string
  } | null
}

export type DisponibilidadResponse = {
  horario: HorarioTurno[]
  disponibilidad: DisponibilidadTurno[]
  estado_observaciones?: DisponibilidadObservaciones
  cursos: DisponibilidadCursos[]
}

export type GuardarHorarioPayload = {
  grupo_aula: number
  docente: number
  carga: number
  horario: string[]
}

export type AccionDocentePayload = {
  docente: number
  carga: number
}

export type HorasDocenteItem = {
  docente_id: number
  dni: string
  nombres_completos: string
  celular?: string
  total_minutos: number
  total_horas: string
  cursos_dictados: string
  grupos?: string
}
