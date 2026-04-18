export const useHorarioObservacion = () => {
  const estado = useState<string | undefined>(
    'horario-observacion-estado',
    () => undefined
  )

  const docenteId = useState<number | undefined>(
    'horario-observacion-docente-id',
    () => undefined
  )

  const docenteNombre = useState<string | undefined>(
    'horario-observacion-docente-nombre',
    () => undefined
  )

  return { estado, docenteId, docenteNombre }
}
