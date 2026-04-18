import { LoginSchema } from '#shared/zod/login.schema'

type LoginResponse = {
  success: boolean
  message?: string
  user?: { email: string }
  token?: string
  data?: { token?: string }
}

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body =>
    LoginSchema.safeParse(body)
  )

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Datos de inicio de sesión inválidos',
      data: result.error.format()
    })
  }

  const { email, password } = result.data
  const config = useRuntimeConfig()

  try {
    const response = await $fetch<LoginResponse>(`${config.public.apiBase}/remote/login`, {
      method: 'POST',
      body: { email, password }
    })

    console.log('[login.post] response:', response)

    if (!response?.success) {
      throw createError({
        statusCode: 401,
        statusMessage: response?.message || 'Credenciales incorrectas'
      })
    }

    await setUserSession(event, {
      user: response.user || {
        email
      },
      token: response.token || response.data?.token || null
    })

    return {
      success: true,
      message: response.message || 'Login exitoso',
      user: response.user || { email }
    }
  } catch (error: any) {
    console.error('[login.post] error:', error)

    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 401,
      statusMessage: error?.response?.data?.message || error?.message || 'Error en login'
    })
  }
})
