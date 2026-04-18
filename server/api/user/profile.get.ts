export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      message: 'No autorizado'
    })
  }
  return {
    user: session.user,
    fetchedAt: new Date().toISOString()
  }
})
