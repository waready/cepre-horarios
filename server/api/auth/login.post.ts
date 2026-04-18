import { LoginSchema } from "#shared/zod/login.schema";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    LoginSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Datos de inicio de sesión inválidos",
      data: result.error.format(),
    });
  }

  const { email, password } = result.data;
  const config = useRuntimeConfig();

  try {
    const response = await $fetch<any>(`${config.public.apiBase}/remote/login`, {
      method: "POST",
      body: { email, password },
    });

    console.log("[login.post] response:", response);

    if (!response?.success) {
      throw createError({
        statusCode: 401,
        statusMessage: response?.message || "Credenciales incorrectas",
      });
    }

    await setUserSession(event, {
      user: response.user || {
        email,
      },
      token: response.token || response.data?.token || null,
    });

    return {
      success: true,
      message: response.message || "Login exitoso",
      user: response.user || { email },
    };
  } catch (error: any) {
    console.error("[login.post] error:", error);

    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 401,
      statusMessage:
        error?.data?.message ||
        error?.response?._data?.message ||
        error?.statusMessage ||
        "Credenciales incorrectas",
    });
  }
});