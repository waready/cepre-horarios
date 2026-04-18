<script setup lang="ts">
const menu = [
  // { label: "Inicio", to: "/" },
  // { label: "Nosotros", to: "/nosotros" },
  // { label: "Ciclos", to: "/ciclos" },
  // { label: "Comunicados", to: "/comunicados" },
  // { label: "Noticias", to: "/noticias" },
  // { label: "Contáctenos", to: "/contacto" },
  // { label: "FAQ", to: "/faq" },
]

const accesos = [
  {
    title: "Panel del estudiante",
    description: "Consulta tu información académica, pagos, inscripciones y más.",
    icon: "i-lucide-graduation-cap",
    to: "https://app.cepreuna.edu.pe/",
    color: "primary",
  },
  {
    title: "Panel del docente",
    description: "Accede a horarios, seguimiento, clases y herramientas docentes.",
    icon: "i-lucide-book-open-check",
    to: "https://app.cepreuna.edu.pe/",
    color: "success",
  },
  {
    title: "Intranet",
    description: "Ingreso rápido a los módulos internos y servicios institucionales.",
    icon: "i-lucide-building-2",
    to: "/login",
    color: "warning",
  },
]

const noticias = [
  {
    title: "Proceso académico y cronogramas",
    text: "Mantente al día con comunicados, fechas importantes y actividades académicas.",
  },
  {
    title: "Servicios para estudiantes y docentes",
    text: "Centraliza accesos y herramientas en una sola plataforma moderna.",
  },
  {
    title: "Preparación preuniversitaria de calidad",
    text: "Una experiencia digital clara, rápida y alineada con la identidad institucional.",
  },
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
    <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-4 py-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <img
                      src="http://www.cepreuna.edu.pe/assets/images/logo/logo.png"
                      alt="Logo CEPREUNA"
                      class="h-12 w-12 rounded-xl object-contain bg-white p-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
                    />
            </div>

            <div class="min-w-0">
              <div class="truncate text-lg font-black tracking-tight">
                CEPREUNA
              </div>
              <div class="truncate text-xs text-slate-500 dark:text-slate-400">
                Centro Preuniversitario de la Universidad Nacional del Altiplano
              </div>
            </div>
          </div>

          <nav class="hidden xl:flex items-center gap-1">
            <NuxtLink
              v-for="item in menu"
              :key="item.label"
              :to="item.to"
              class="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="flex items-center gap-2">
            <!-- <UButton
              to="/login"
              variant="ghost"
              color="neutral"
              icon="i-lucide-log-in"
              class="hidden sm:inline-flex"
            >
              Login
            </UButton> -->

            <UButton
              to="/login"
              color="primary"
              icon="i-lucide-log-in"
            >
              Intranet
            </UButton>
          </div>
        </div>
      </div>
    </header>

    <main>
      <section class="relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700"></div>
        <div class="absolute inset-0 opacity-15">
          <div class="h-full w-full bg-[radial-gradient(circle_at_top_right,white,transparent_25%),radial-gradient(circle_at_bottom_left,white,transparent_20%)]"></div>
        </div>

        <div class="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div class="flex flex-col justify-center">
            <div class="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20">
              <UIcon name="i-lucide-badge-check" class="size-4" />
              Plataforma institucional CEPREUNA
            </div>

            <h1 class="max-w-2xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Asegura tu ingreso con una portada moderna e institucional
            </h1>

            <p class="mt-5 max-w-2xl text-base leading-7 text-emerald-50/95 sm:text-lg">
              Portal principal para estudiantes, docentes e intranet, con accesos rápidos,
              cronogramas, noticias y servicios clave de CEPREUNA.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <UButton
                to="https://app.cepreuna.edu.pe/"
                target="_blank"
                color="neutral"
                variant="solid"
                icon="i-lucide-user-round"
                class="bg-white text-emerald-700 hover:bg-emerald-50"
              >
                Panel estudiante
              </UButton>

              <UButton
                to="https://app.cepreuna.edu.pe/"
                target="_blank"
                variant="outline"
                color="neutral"
                icon="i-lucide-book-open"
                class="border-white/40 text-white hover:bg-white/10"
              >
                Panel docente
              </UButton>

              <UButton
                to="/login"
                variant="ghost"
                color="neutral"
                icon="i-lucide-arrow-right"
                class="text-white hover:bg-white/10"
              >
                Ir al login
              </UButton>
            </div>

            <div class="mt-8 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <div class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                  Contacto
                </div>
                <div class="text-sm text-white">Jr. Acora N° 235 - Puno</div>
                <div class="text-sm text-emerald-100">informes@cepreuna.edu.pe</div>
              </div>

              <div class="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <div class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                  Ciclo destacado
                </div>
                <div class="text-sm text-white">Marzo - Julio 2026</div>
                <div class="text-sm text-emerald-100">Inicio de clases: 23 de marzo</div>
              </div>
            </div>
          </div>

          <div class="flex items-center">
            <div class="w-full rounded-[28px] bg-white p-4 shadow-2xl ring-1 ring-black/5 dark:bg-slate-900">
              <div class="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                  <div class="flex items-center gap-3">
                    <img
                      src="http://www.cepreuna.edu.pe/assets/images/logo/logo.png"
                      alt="Logo CEPREUNA"
                      class="h-12 w-12 rounded-xl object-contain bg-white p-1 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
                    />
                    <div>
                      <div class="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Bienvenido
                      </div>
                      <div class="text-xl font-black tracking-tight">
                        Portal CEPREUNA
                      </div>
                    </div>
                  </div>

                  <UBadge color="success" variant="subtle">
                    En línea
                  </UBadge>
                </div>

                <div class="grid gap-4 p-5 sm:grid-cols-2">
                  <div class="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900/40">
                    <div class="mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <UIcon name="i-lucide-calendar-range" class="size-5" />
                      <span class="font-bold">Cronograma actual</span>
                    </div>
                    <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Inscripciones, clases y fechas importantes del ciclo vigente.
                    </p>
                  </div>

                  <div class="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100 dark:bg-amber-950/30 dark:ring-amber-900/40">
                    <div class="mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <UIcon name="i-lucide-newspaper" class="size-5" />
                      <span class="font-bold">Noticias y comunicados</span>
                    </div>
                    <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Información institucional, anuncios y novedades del proceso académico.
                    </p>
                  </div>

                  <div class="rounded-2xl bg-sky-50 p-4 ring-1 ring-sky-100 dark:bg-sky-950/30 dark:ring-sky-900/40">
                    <div class="mb-2 flex items-center gap-2 text-sky-700 dark:text-sky-400">
                      <UIcon name="i-lucide-users" class="size-5" />
                      <span class="font-bold">Docentes y estudiantes</span>
                    </div>
                    <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Accesos rápidos a paneles y servicios académicos principales.
                    </p>
                  </div>

                  <div class="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100 dark:bg-violet-950/30 dark:ring-violet-900/40">
                    <div class="mb-2 flex items-center gap-2 text-violet-700 dark:text-violet-400">
                      <UIcon name="i-lucide-shield" class="size-5" />
                      <span class="font-bold">Intranet segura</span>
                    </div>
                    <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Ingreso al entorno administrativo con una interfaz más clara y actual.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div>
            <div class="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
              Acceso rápido
            </div>
            <h2 class="mt-1 text-3xl font-black tracking-tight">
              Plataformas y servicios
            </h2>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <UCard
            v-for="item in accesos"
            :key="item.title"
            class="rounded-3xl border border-slate-200 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800"
          >
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-emerald-700 dark:bg-slate-800 dark:text-emerald-400">
                <UIcon :name="item.icon" class="size-7" />
              </div>

              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-bold">{{ item.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {{ item.description }}
                </p>

                <div class="mt-4">
                  <UButton :to="item.to" :color="item.color as any" trailing-icon="i-lucide-arrow-right">
                    Ingresar
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div class="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <UCard class="rounded-3xl border border-slate-200 dark:border-slate-800">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <UIcon name="i-lucide-calendar-days" class="size-6" />
                </div>
                <div>
                  <div class="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                    Ciclo vigente
                  </div>
                  <h3 class="text-2xl font-black tracking-tight">Marzo - Julio 2026</h3>
                </div>
              </div>
            </template>

            <div class="grid gap-4 sm:grid-cols-3">
              <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <div class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Inscripciones
                </div>
                <div class="mt-2 font-semibold">02 de marzo de 2026</div>
              </div>

              <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <div class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Inicio de clases
                </div>
                <div class="mt-2 font-semibold">23 de marzo de 2026</div>
              </div>

              <div class="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <div class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Culminación
                </div>
                <div class="mt-2 font-semibold">10 de julio de 2026</div>
              </div>
            </div>
          </UCard>

          <UCard class="rounded-3xl border border-slate-200 dark:border-slate-800">
            <template #header>
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  <UIcon name="i-lucide-bell-ring" class="size-6" />
                </div>
                <div>
                  <div class="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
                    Destacados
                  </div>
                  <h3 class="text-2xl font-black tracking-tight">Información útil</h3>
                </div>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="item in noticias"
                :key="item.title"
                class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div class="font-bold">{{ item.title }}</div>
                <div class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {{ item.text }}
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="grid gap-6 md:grid-cols-3">
          <div>
            <div class="text-lg font-black tracking-tight">CEPREUNA</div>
            <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Plataforma institucional para estudiantes, docentes y servicios académicos.
            </p>
          </div>

          <div>
            <div class="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              Enlaces
            </div>
            <div class="mt-3 space-y-2 text-sm">
            </div>
          </div>

          <div>
            <div class="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              Contacto
            </div>
            <div class="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div>Jr. Acora N° 235 - Puno</div>
              <div>informes@cepreuna.edu.pe</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>