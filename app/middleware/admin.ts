export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { loggedIn, user } = useUserSession()

  const roles = (user.value as any)?.roles || []
  const isAdmin = roles.includes('Administrador')

  if (!loggedIn.value || !isAdmin) {
    return navigateTo('/dashboard/horario')
  }
})
