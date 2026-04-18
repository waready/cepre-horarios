<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from "@nuxt/ui";
import { LoginSchema } from "#shared/zod/login.schema";
import type { LoginTypeZodSchema } from "#shared/zod/login.schema";

const { login } = useAuthApi();

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "Ingrese su email",
    defaultValue: "",
    required: true,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Ingrese su contraseña",
    required: true,
  },
  {
    name: "remember",
    label: "Recordarme",
    type: "checkbox",
  },
];

async function onSubmit(payload: FormSubmitEvent<LoginTypeZodSchema>) {
  try {
    await login(payload.data);
  } catch (error) {
    // El error visual (toast) ya se maneja en el composable
    console.error("Error en login:", error);
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="LoginSchema"
        title="Iniciar Sesión"
        description="Ingrese sus credenciales para iniciar sesión"
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
