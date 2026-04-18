import { z } from "zod";
export const LoginSchema = z.object({
  email: z.email("Email inválido"),
  password: z
    .string("La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginTypeZodSchema = z.output<typeof LoginSchema>;
