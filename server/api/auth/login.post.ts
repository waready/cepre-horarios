import { LoginSchema } from "#shared/zod/login.schema";
import { th } from "zod/locales";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    LoginSchema.safeParse(body),
  );

  if (!result.success) {
    return {
      statusCode: 400,
      message: "Datos de inicio de sesión inválidos",
      data: result.error.format(),
    };
  }

  const { email, password } = result.data;

  try {
    const config = useRuntimeConfig();
    const response = await $fetch<{ success: boolean; message: string; user?: any; error?: string }>(
      `${config.public.apiBase}/remote/login`,
      {
        method: "POST",
        body: { email, password },
      }
    );

    if (response.success) {
      await setUserSession(event, {
        user: {
          email: email,
          token: response, // El api retorna un usuario en vez de un token
        },

      });

      return {
        message: response.message || "Login exitoso",
      };
    } else {
      throw createError({
        statusCode: 401,
        statusMessage: response.message || "Credenciales incorrectas",
      });
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 401,
      statusMessage: error.data?.message || "Credenciales incorrectas",
    });
  }
});
