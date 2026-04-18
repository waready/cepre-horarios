export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn } = await useUserSession();

  if (!loggedIn.value) {
    return navigateTo("/login");
  }
});
