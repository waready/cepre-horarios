<script setup lang="ts">
import { ref, computed } from "vue";

const emit = defineEmits<{
  (e: "refresh"): void
}>()

type Curso = {
  id?: number;
  denominacion?: string;
  color?: string;
};

type Docente = {
  id?: number;
  nombres?: string;
  paterno?: string;
  materno?: string;
};

type Carga = {
  id?: number;
  docente?: Docente | null;
};

type withDefaultsorarioItem = {
  id: number;
  dia: string | number;
  grupo?: string;
  sede?: string;
  curso?: Curso | null;
  carga?: Carga | null;
};

type withDefaultsorarioBloque = {
  id?: number;
  hora_inicio: string;
  hora_fin: string;
  horario: HorarioItem[];
};

type HorarioTurno = {
  id: number;
  turno: string;
  disponibilidad: HorarioBloque[];
};

// const props = withDefaults(
//   defineProps<{
//     horarios: HorarioTurno[];
//     titulo?: string;
//     totalHorasFicha?: string;
//     estadoObservacion?: string;
//   }>(),
//   {
//     titulo: "Horario Docente",
//   },
// );

const dias = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
];

type EstadoObservaciones = {
  total?: number;
  pendiente?: number;
  atendido?: number;
  cerrado?: number;
  otros?: Record<string, number>;
};

const props = withDefaults(
  defineProps<{
    horarios: HorarioTurno[];
    titulo?: string;
    totalHorasFicha?: string;
    estadoObservaciones?: EstadoObservaciones | null;
  }>(),
  {
    titulo: "Horario Docente",
  },
);

const otrosEstados = computed(() => {
  return Object.entries(props.estadoObservaciones?.otros ?? {}).filter(
    ([, cantidad]) => Number(cantidad) > 0,
  );
});

function formatEstadoLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizarDia(value: string | number | undefined) {
  return Number(value ?? 0);
}

function itemsPorDia(items: HorarioItem[], dia: number) {
  return items.filter((item) => normalizarDia(item.dia) === dia);
}

function minutosEntre(horaInicio: string, horaFin: string) {
  const [h1, m1] = horaInicio.split(":").map(Number);
  const [h2, m2] = horaFin.split(":").map(Number);

  return (h2 || 0) * 60 + (m2 || 0) - ((h1 || 0) * 60 + (m1 || 0));
}

const cursosDelHorario = computed(() => {
  const map = new Map<
    string,
    { id: number | null; denominacion: string; color?: string }
  >();

  for (const turno of props.horarios || []) {
    for (const bloque of turno.disponibilidad || []) {
      for (const item of bloque.horario || []) {
        const curso = item.curso;
        if (!curso?.denominacion) continue;

        const key = String(curso.id ?? curso.denominacion);

        if (!map.has(key)) {
          map.set(key, {
            id: curso.id ?? null,
            denominacion: curso.denominacion,
            color: curso.color,
          });
        }
      }
    }
  }

  return Array.from(map.values());
});

const totalMinutos = computed(() => {
  const usados = new Set<string>();
  let total = 0;

  for (const turno of props.horarios || []) {
    for (const bloque of turno.disponibilidad || []) {
      for (const item of bloque.horario || []) {
        const key = String(item.id);
        if (usados.has(key)) continue;

        usados.add(key);
        total += minutosEntre(bloque.hora_inicio, bloque.hora_fin);
      }
    }
  }

  return total;
});

const totalHorasDocente = computed(() => {
  if (props.totalHorasFicha) return `${props.totalHorasFicha} h`;
});

const columnasTurno = computed(() => {
  return [
    { accessorKey: "bloque", header: "Bloque" },
    ...dias.map((dia) => ({
      accessorKey: `dia_${dia.id}`,
      header: dia.label,
    })),
  ];
});

const isOpen = ref(false);
const selectedItem = ref<HorarioItem | null>(null);
const selectedBloque = ref<HorarioBloque | null>(null);
const selectedTurno = ref<HorarioTurno | null>(null);

function openModal(
  item: HorarioItem,
  bloque: HorarioBloque,
  turno: HorarioTurno,
) {
  selectedItem.value = item;
  selectedBloque.value = bloque;
  selectedTurno.value = turno;
  isOpen.value = true;
}

function onSaved() {
  isOpen.value = false
  emit("refresh")
}
</script>

<template>
  <UCard
    :ui="{
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
      shadow: 'shadow-md shadow-gray-200/50 dark:shadow-black/20',
    }"
    class="overflow-hidden rounded-2xl bg-white dark:bg-gray-900 transition-all"
  >
    <template #header>
      <div class="flex flex-col gap-6">
        <!-- Header Principal -->
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-primary/10 rounded-xl text-primary">
              <UIcon name="i-lucide-calendar-days" class="w-6 h-6" />
            </div>
            <h3
              class="text-2xl tracking-tight font-black text-gray-900 dark:text-white"
              style="letter-spacing: -0.02em"
            >
              {{ titulo }}
            </h3>
          </div>

          <UBadge
            :color="totalHorasFicha ? 'info' : 'primary'"
            variant="subtle"
            size="lg"
            :ui="{ rounded: 'rounded-full' }"
            class="px-4 py-1.5 shadow-sm border border-primary/20"
          >
            <UIcon
              name="i-lucide-clock"
              class="w-4 h-4 mr-1.5"
            />
            <span class="font-bold">{{ totalHorasDocente }}</span>
          
          </UBadge>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Cursos Leyenda -->
          <div
            class="lg:col-span-2 bg-gray-50/80 dark:bg-gray-950/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800"
          >
            <div
              class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"
            >
              <UIcon name="i-lucide-book-open" class="w-4 h-4" /> Cursos
              Asignados
            </div>

            <div v-if="cursosDelHorario.length" class="flex flex-wrap gap-2">
              <div
                v-for="curso in cursosDelHorario"
                :key="curso.id ?? curso.denominacion"
                class="flex items-center gap-2.5 bg-white dark:bg-gray-900 pr-3 pl-1.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700/60 shadow-sm text-sm font-medium hover:scale-[1.02] transition-transform cursor-default"
              >
                <div
                  class="flex-shrink-0 h-4 w-4 rounded-full shadow-inner ring-1 ring-black/10 overflow-hidden relative"
                  :style="{ background: curso.color || '#64748b' }"
                >
                  <div
                    class="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"
                  ></div>
                </div>
                <span
                  class="text-gray-700 dark:text-gray-200 text-xs tracking-wide"
                  >{{ curso.denominacion }}</span
                >
              </div>
            </div>

            <div
              v-else
              class="text-sm text-gray-400 italic flex items-center gap-2"
            >
              <UIcon name="i-lucide-info" class="w-4 h-4" />
              Sin cursos asignados
            </div>
          </div>

          <!-- Turno Info -->
          <div
            class="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex flex-col justify-center relative overflow-hidden group"
          >
            <UIcon
              name="i-lucide-clipboard-list"
              class="w-24 h-24 text-amber-500/10 absolute -right-4 -bottom-4 transform group-hover:scale-110 transition-transform duration-500"
            />

            <span
              class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest z-10 mb-1"
            >
              Observaciones:
            </span>

            <span
              class="text-3xl font-black text-amber-700 dark:text-amber-300 z-10 tracking-tight"
            >
              {{ props.estadoObservaciones?.total ?? 0 }}
            </span>
            <div v-if="otrosEstados.length" class="z-10 w-full mt-4">
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="[key, cantidad] in otrosEstados"
                  :key="key"
                  color="error"
                  variant="subtle"
                  class="capitalize"
                >
                  {{ formatEstadoLabel(key) }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="!horarios?.length"
      class="py-16 text-center text-sm text-gray-500 bg-gray-50/50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800"
    >
      <UIcon
        name="i-lucide-calendar-off"
        class="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3"
      />
      No hay un horario o disponibilidad para mostrar.
    </div>

    <div
      v-else
      class="space-y-10 border-t border-gray-100 dark:border-gray-800 p-2 md:p-6 bg-gray-50/30 dark:bg-gray-950/30"
    >
      <section v-for="turno in horarios" :key="turno.id" class="space-y-4">
        <div class="flex items-center gap-3 ml-2">
          <div class="h-6 w-1.5 rounded-full bg-emerald-500"></div>
          <h4
            class="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight"
          >
            Horario {{ turno.turno }}
          </h4>
        </div>

        <div
          class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 border-collapse"
        >
          <UTable
            :data="turno.disponibilidad"
            :columns="columnasTurno"
            class="w-full"
            :ui="
              {
                wrapper: 'relative',
                th: {
                  base: 'border-b border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-center text-gray-500 dark:text-gray-400 font-semibold uppercase text-xs h-12',
                  padding: 'px-2',
                },
                td: {
                  base: 'border-b border-r border-gray-100 dark:border-gray-800/60 align-top transition-colors relative',
                  padding: 'p-1',
                },
                tr: {
                  base: 'hover:bg-gray-50/30 dark:hover:bg-gray-800/10 group',
                },
              } as any
            "
          >
            <!-- EJE DE TIEMPO LATERAL -->
            <template #bloque-cell="{ row }">
              <div
                class="flex flex-col items-center justify-start h-full pt-1.5 opacity-80"
              >
                <span
                  class="text-[11px] font-bold text-gray-700 dark:text-gray-300"
                  >{{ row.original.hora_inicio }}</span
                >
                <span class="text-[10px] font-medium text-gray-400">{{
                  row.original.hora_fin
                }}</span>
              </div>
            </template>

            <!-- MALLA DEL CALENDARIO -->
            <template
              v-for="dia in dias"
              :key="dia.id"
              #[`dia_${dia.id}-cell`]="{ row }"
            >
              <div
                class="flex min-h-[70px] flex-col h-full relative group/cell"
              >
                <template
                  v-for="item in itemsPorDia(row.original.horario, dia.id)"
                  :key="item.id"
                >
                  <!-- EVENTO ESTILO GOOGLE CALENDAR -->
                  <div
                    class="rounded p-2 shadow-sm hover:shadow-md transition-all flex flex-col h-full border-l-4 relative overflow-hidden cursor-pointer"
                    :style="{
                      backgroundColor: (item.curso?.color || '#3b82f6') + '25',
                      borderColor: item.curso?.color || '#3b82f6',
                    }"
                    @click="openModal(item, row.original, turno)"
                  >
                    <!-- Capa sutil de color para oscurecer/aclarar si es necesario -->
                    <div
                      class="absolute inset-0 bg-white/10 dark:bg-black/10 pointer-events-none"
                    ></div>

                    <div
                      class="font-bold text-[12px] leading-tight mb-1 relative z-10 truncate drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,1)]"
                      :style="{ color: item.curso?.color || '#3b82f6' }"
                    >
                      <span
                        class="filter brightness-75 dark:brightness-150 saturate-150"
                        >{{
                          item.curso?.denominacion || "Curso sin nombre"
                        }}</span
                      >
                    </div>

                    <div
                      class="flex flex-col gap-0.5 mt-auto relative z-10 text-[10px] font-semibold opacity-90"
                      :style="{ color: item.curso?.color || '#3b82f6' }"
                    >
                      <span
                        class="flex items-center gap-1 filter brightness-50 dark:brightness-150"
                        ><UIcon name="i-lucide-map-pin" class="w-3 h-3" />
                        {{ item.sede || "SEDE" }}</span
                      >
                      <span
                        class="flex items-center gap-1 filter brightness-50 dark:brightness-150"
                        ><UIcon name="i-lucide-users" class="w-3 h-3" />
                        {{ item.grupo || "GRUPO" }}</span
                      >
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </UTable>
        </div>
      </section>
    </div>
  </UCard>

  <HorarioSeguimientoModal
    v-model:open="isOpen"
    :selected-item="selectedItem as any"
    :selected-bloque="selectedBloque as any"
    :selected-turno="selectedTurno as any"
    @saved="onSaved"
  />
</template>
