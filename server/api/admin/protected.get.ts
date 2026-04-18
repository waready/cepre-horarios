export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  return {
    message: 'ruta protegida exitoso',
    session
  }
})
