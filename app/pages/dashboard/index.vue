<script setup>
definePageMeta({
  middleware: ['auth']
})

const { logout } = useAuthApi()

const API_BASE = 'https://cepreuna.info/api/stats-inscripciones'
const REFRESH_MS = 60000

const colors = ['#003366', '#0381d9', '#0da954', '#f97316', '#8b5cf6', '#ec4899']

const { data: stats, refresh, pending } = useAsyncData('dashboard-stats', async () => {
  const [rTot, rAreas, rSedes] = await Promise.all([
    $fetch(`${API_BASE}/totales`),
    $fetch(`${API_BASE}/por-area`),
    $fetch(`${API_BASE}/por-sede`)
  ])
  return {
    totalInscritos: rTot.total_inscritos || 0,
    totalPagos: rTot.total_pagos_25feb || 0,
    totalHoy: rTot.total_hoy || 0,
    areas: rAreas.areas || [],
    sedes: rSedes.sedes || []
  }
}, {
  default: () => ({
    totalInscritos: 0,
    totalPagos: 0,
    totalHoy: 0,
    areas: [],
    sedes: []
  })
})

const totalInscritos = computed(() => stats.value.totalInscritos)
const totalPagos = computed(() => stats.value.totalPagos)
const totalHoy = computed(() => stats.value.totalHoy)
const areas = computed(() => stats.value.areas)
const sedes = computed(() => stats.value.sedes)

const pagosPendientes = computed(() => totalInscritos.value - totalPagos.value)
const maxArea = computed(() => Math.max(...areas.value.map(a => a.total_inscritos), 1))
const pctArea = a => Math.round((a.total_inscritos / maxArea.value) * 100)

const progreso = ref(100)

let timer = null

onMounted(() => {
  timer = setInterval(() => refresh(), REFRESH_MS)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <UDashboardPanel id="dashboard">
    <template #header>
      <UDashboardNavbar title="Dashboard">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UColorModeButton />
          <UButton
            variant="ghost"
            color="error"
            @click="logout"
          >
            Logout
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UContainer>
        <div
          class="stats-root bg-background-light font-display text-slate-900 antialiased min-h-screen p-6 lg:p-8"
        >
          <div class="space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full">
            <!-- KPI Section -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-2 bg-primary rounded-2xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
                <div class="relative z-10">
                  <h3 class="text-white/80 font-medium text-sm lg:text-base uppercase tracking-wider">
                    Total General de Inscritos
                  </h3>
                  <div class="mt-4 flex items-baseline gap-4">
                    <span class="text-5xl lg:text-6xl font-black tracking-tight">{{ totalInscritos }}</span>
                    <div class="bg-white/20 px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold flex items-center gap-1">
                      <UIcon
                        name="i-lucide-trending-up"
                        class="size-4"
                      />
                      Actualizado en tiempo real
                    </div>
                  </div>
                  <div class="mt-6 flex items-center gap-4 text-white/70">
                    <div class="flex items-center gap-2">
                      <UIcon
                        name="i-lucide-dollar-sign"
                        class="size-4"
                      />
                      <span class="text-xs font-semibold uppercase tracking-tight">
                        {{ totalPagos }} Pagos verificados
                      </span>
                    </div>
                    <div class="h-4 w-px bg-white/20" />
                    <div class="flex items-center gap-2 uppercase tracking-tight text-xs">
                      <UIcon
                        name="i-lucide-calendar"
                        class="size-4"
                      />
                      <span>Ciclo 2026-I</span>
                    </div>
                  </div>
                </div>
                <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              </div>

              <div class="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
                <h3 class="text-slate-500 font-bold text-xs uppercase tracking-widest">
                  Estado del Ciclo
                </h3>
                <p class="text-2xl font-bold text-primary mt-1">
                  Marzo - Julio
                </p>
                <div class="mt-6 pt-6 border-t border-slate-100">
                  <div class="flex justify-between text-xs font-bold mb-2">
                    <span class="text-slate-500 uppercase">Progreso Global</span>
                    <span class="text-primary">{{ progreso }}%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-3">
                    <div
                      class="bg-primary h-3 rounded-full shadow-sm"
                      :style="{ width: '100%' }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <!-- Distribución por Área -->
              <section class="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                <div class="flex items-center justify-between mb-8">
                  <div>
                    <h3 class="text-lg font-bold text-slate-800">
                      Distribución por Área
                    </h3>
                    <p class="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                      Inscritos por facultades
                    </p>
                  </div>
                  <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                    <UIcon
                      name="i-lucide-building-2"
                      class="size-4"
                    />
                  </div>
                </div>
                <div class="space-y-6">
                  <div
                    v-if="!areas.length"
                    class="animate-pulse space-y-4"
                  >
                    <div class="h-12 bg-slate-100 rounded-xl" />
                    <div class="h-12 bg-slate-100 rounded-xl" />
                    <div class="h-12 bg-slate-100 rounded-xl" />
                  </div>
                  <div
                    v-for="(area, i) in areas"
                    :key="area.area"
                    class="space-y-2"
                  >
                    <div class="flex justify-between items-end">
                      <span class="text-[10px] font-bold uppercase tracking-widest text-slate-600">{{ area.area }}</span>
                      <span class="text-lg font-black text-slate-800">{{ area.total_inscritos }}</span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-1000"
                        :style="{ width: pctArea(area) + '%', backgroundColor: colors[i % colors.length] }"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <!-- Top Sedes -->
              <section class="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                <div class="flex items-center justify-between mb-8">
                  <div>
                    <h3 class="text-lg font-bold text-slate-800">
                      Top Sedes
                    </h3>
                    <p class="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                      Alcance regional CEPREUNA
                    </p>
                  </div>
                  <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                    <UIcon
                      name="i-lucide-map-pin"
                      class="size-4"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    v-if="!sedes.length"
                    class="animate-pulse space-y-4 col-span-full"
                  >
                    <div class="h-16 bg-slate-100 rounded-xl" />
                    <div class="h-16 bg-slate-100 rounded-xl" />
                    <div class="h-16 bg-slate-100 rounded-xl" />
                    <div class="h-16 bg-slate-100 rounded-xl" />
                  </div>
                  <div
                    v-for="sede in sedes"
                    :key="sede.sede"
                    class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group"
                  >
                    <div class="flex flex-col">
                      <span class="text-xs font-bold text-slate-700 group-hover:text-primary">{{ sede.sede }}</span>
                      <span class="text-[9px] text-slate-400 uppercase tracking-tighter">Campus Regional</span>
                    </div>
                    <div class="flex items-baseline gap-1">
                      <span class="text-xl font-black text-primary">{{ sede.total_inscritos }}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Footer Summary -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Inscripciones Hoy
                </p>
                <p class="text-base font-bold text-primary">
                  {{ totalHoy }} hoy
                </p>
              </div>
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Pagos Pendientes
                </p>
                <p class="text-base font-bold text-amber-600">
                  {{ pagosPendientes }}
                </p>
              </div>
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Soporte Técnico
                </p>
                <p class="text-base font-bold text-emerald-600">
                  En Línea
                </p>
              </div>
              <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <p class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Servidor API
                </p>
                <p class="text-base font-bold text-primary">
                  Estable
                </p>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.stats-root {
  --primary: #003366;
  --primary-light: #004080;
  --primary-blue: #0381d9;

  font-family: "Inter", sans-serif;
}
.bg-background-light { background-color: var(--background-light); }
.bg-primary { background-color: var(--primary); }
.text-primary { color: var(--primary); }
.font-display { font-family: 'Inter', sans-serif; }
</style>
