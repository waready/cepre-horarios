export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { loggedIn } = await useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
