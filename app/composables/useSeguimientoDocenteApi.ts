import type {
  GuardarSeguimientoPayload,
  ListarObservacionesResponse
} from '#shared/types/seguimientoDocente'

export function useSeguimientoDocenteApi() {
  const config = useRuntimeConfig()
  const { user } = useUserSession()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const tokenString = (user.value as any)?.token?.token

      if (tokenString) {
        options.headers = options.headers || {};
        (options.headers as any).Authorization = `Bearer ${tokenString}`
      }
    }
  })

  const guardarSeguimiento = (payload: GuardarSeguimientoPayload) =>
    api<{ status: boolean, message: string }>(
      '/seguimiento-docente/observaciones',
      {
        method: 'POST',
        body: payload
      }
    )

  const listarObservaciones = (params?: {
    page?: number
    per_page?: number
    docente_id?: number
    estado?: string
    search?: string
  }) =>
    api<ListarObservacionesResponse>('/seguimiento-docente/observaciones', {
      method: 'GET',
      query: params
    })

  const eliminarObservacion = (id: number) =>
    api<{ status: boolean, message: string }>(
      `/seguimiento-docente/observaciones/${id}`,
      {
        method: 'DELETE'
      }
    )

  const actualizarObservacion = (id: number, payload: GuardarSeguimientoPayload) =>
    api<{ status: boolean, message: string }>(
      `/seguimiento-docente/observaciones/${id}`,
      {
        method: 'PUT',
        body: payload
      }
    )

  return {
    guardarSeguimiento,
    listarObservaciones,
    eliminarObservacion,
    actualizarObservacion
  }
}
