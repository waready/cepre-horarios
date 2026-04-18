import type { LoginTypeZodSchema } from "#shared/zod/login.schema";
import type { FetchError } from "ofetch";

export function useAuthApi() {
  const { fetch: fetchSession, clear: clearSession, loggedIn, user } = useUserSession();
  const toast = useToast();

  const login = async (credentials: LoginTypeZodSchema) => {
    try {
      await $fetch("/api/auth/login", {
        method: "POST",
        body: credentials,
      });

      // Actualizamos el estado de la sesión en el cliente
      await fetchSession();

      toast.add({
        title: "Login Exitoso",
        description: "Has iniciado sesión correctamente",
        color: "success",
      });

      await navigateTo("/dashboard");
    } catch (error) {
      const err = error as FetchError;
      toast.add({
        title: "Login Error",
        description: err.data?.message || "Ocurrió un error al iniciar sesión",
        color: "error",
      });
      // Lanza el error por si necesitamos hacer algo más en la vista (ej: quitar loading state)
      throw error;
    }
  };

  const logout = async () => {
    // Limpiamos la sesión segura de Nuxt Auth Utils
    await clearSession();
    await navigateTo("/login");
  };

  return {
    loggedIn,
    user,
    login,
    logout,
  };
}
