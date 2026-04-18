<script setup lang="ts">
import type {
  Opcion,
  Carga,
  CargaAcademicaResponse,
  DisponibilidadResponse,
  HorasDocenteItem,
} from "~~/shared/types/horario";

const api = useHorarioApi();

const area = ref<number | undefined>(undefined);
const turno = ref<number | undefined>(undefined);
const sede = ref<number | undefined>(undefined);
const grupo = ref<number | undefined>(undefined);
const docente = ref<number | any | null>(null);
const curso = ref<number | null>(null);

const colorCurso = ref("");
const diasMarcados = ref<string[]>([]);
const cargandoInicial = ref(false);
const cargandoGrupos = ref(false);
const cargandoCargas = ref(false);
const cargandoDisponibilidad = ref(false);
const guardando = ref(false);

const areas = ref<Opcion[]>([]);
const turnos = ref<Opcion[]>([]);
const sedes = ref<Opcion[]>([]);
const grupos = ref<any[]>([]);
const docentes = ref<Array<{ id: number; text: string }>>([]);
const teachersWithHours = ref<HorasDocenteItem[]>([]);

// 1. Áreas
const areasOpciones = computed(() => {
  return areas.value.map((item) => ({
    label: item.denominacion,
    value: item.id,
  }));
});

// 2. Turnos
const turnosOpciones = computed(() => {
  return turnos.value.map((item) => ({
    label: item.denominacion,
    value: item.id,
  }));
});

// 3. Sedes
const sedesOpciones = computed(() => {
  return sedes.value.map((item) => ({
    label: item.denominacion,
    value: item.id,
  }));
});

// 4. Grupos (Mantenemos tu lógica de validación)
const gruposOpciones = computed(() => {
  if (!grupos.value) return [];
  return grupos.value.map((item: any) => ({
    label: item.grupo?.denominacion || item.grupo || `Grupo ${item.id}`,
    value: item.id,
  }));
});

// 5. Docentes (Directamente de la base, sin filtrar manualmente)
const docentesOpciones = computed(() => {
  if (!docentes.value) return [];
  return docentes.value.map((item) => ({
    label: item.text,
    value: item.id,
  }));
});

type DisponibilidadObservaciones = {
  total: number
  pendiente: number
  atendido: number
  cerrado: number
  otros: Record<string, number>
}

const cargas = ref<Carga[]>([]);
const horariosGrupo = ref<any[]>([]);
const turnoGrupo = ref("");

const disponibilidadHorario = ref<any[]>([]);
const disponibilidad = ref<any[]>([]);
const disponibilidadCursos = ref<any[]>([]);
const disponibilidadObservaciones = ref<DisponibilidadObservaciones | null>(null)

const selectedTeacherTotalHours = computed(() => {
  if (!docente.value || !teachersWithHours.value.length) return undefined;
  const dVal =
    typeof docente.value === "object" && docente.value !== null
      ? (docente.value as any).value
      : docente.value;
  const found = teachersWithHours.value.find((t) => Number(t.docente_id) === Number(dVal));
  return found?.total_horas;
});

const errors = ref<Record<string, string[]>>({});
const mensaje = ref("");
const mensajeTipo = ref<"success" | "error" | "info">("info");

function mostrarMensaje(
  texto: string,
  tipo: "success" | "error" | "info" = "info",
) {
  mensaje.value = texto;
  mensajeTipo.value = tipo;
}

function limpiarMensaje() {
  mensaje.value = "";
}

function limpiarHorarioGrupo() {
  curso.value = null;
  colorCurso.value = "";
  diasMarcados.value = [];
  cargas.value = [];
  horariosGrupo.value = [];
  turnoGrupo.value = "";
}

function limpiarDisponibilidad() {
  disponibilidadHorario.value = [];
  disponibilidad.value = [];
  disponibilidadCursos.value = [];
  disponibilidadObservaciones.value = null;
}

async function cargarInicial() {
  cargandoInicial.value = true;
  limpiarMensaje();

  try {
    const [areasRes, turnosRes, sedesRes, docentesRes, teachersWithHoursRes] =
      await Promise.all([
        api.getAreas(),
        api.getTurnos(),
        api.getSedes(),
        api.getDocentes(),
        api.listarHorasDocentes(),
      ]);

    areas.value = areasRes;
    turnos.value = turnosRes;
    sedes.value = sedesRes;
    docentes.value = docentesRes;
    teachersWithHours.value = teachersWithHoursRes || [];
  } catch (error: any) {
    mostrarMensaje(
      error?.data?.message || "No se pudo cargar la información inicial",
      "error",
    );
  } finally {
    cargandoInicial.value = false;
  }
}

async function cargarGrupos() {
  cargandoGrupos.value = true;
  grupo.value = undefined;
  limpiarHorarioGrupo();

  try {
    const getVal = (v: any) =>
      typeof v === "object" && v !== null ? v.value : v;
    grupos.value = await api.getGrupoAulas({
      area: getVal(area.value),
      turno: getVal(turno.value),
      sede: getVal(sede.value),
    });
  } catch (error: any) {
    grupos.value = [];
    mostrarMensaje(
      error?.data?.message || "No se pudieron cargar los grupos",
      "error",
    );
  } finally {
    cargandoGrupos.value = false;
  }
}

async function changeGrupo() {
  limpiarHorarioGrupo();
  errors.value = {};

  if (!grupo.value) return;

  cargandoCargas.value = true;

  try {
    const groupId =
      typeof grupo.value === "object" && grupo.value !== null
        ? (grupo.value as any).value
        : grupo.value;
    const response: CargaAcademicaResponse =
      await api.getCargaAcademica(groupId);
    cargas.value = response.cargaAcademica || [];
    horariosGrupo.value = response.horario || [];
    turnoGrupo.value = response.turno?.denominacion || "";
  } catch (error: any) {
    mostrarMensaje(
      error?.data?.message || "No se pudo cargar la carga académica",
      "error",
    );
  } finally {
    cargandoCargas.value = false;
  }
}

async function changeDocente() {
  limpiarDisponibilidad();

  if (!docente.value) return;

  cargandoDisponibilidad.value = true;

  try {
    const dVal =
      typeof docente.value === "object" && docente.value !== null
        ? (docente.value as any).value
        : docente.value;
    const tVal =
      typeof turno.value === "object" && turno.value !== null
        ? (turno.value as any).value
        : turno.value;

    if (!dVal) return;

    const response: DisponibilidadResponse = await api.getDisponibilidad({
      docente: dVal,
      turno: tVal,
    });

    disponibilidadHorario.value = response.horario || [];
    disponibilidad.value = response.disponibilidad || [];
    disponibilidadCursos.value = response.cursos || [];
    disponibilidadObservaciones.value = response.estado_observaciones || null;
  } catch (error: any) {
    mostrarMensaje(
      error?.data?.message || "No se pudo cargar la disponibilidad del docente",
      "error",
    );
  } finally {
    cargandoDisponibilidad.value = false;
  }
}

function seleccionarCurso(carga: Carga) {
  curso.value = carga.id;
  colorCurso.value = carga.curso?.color || "";
  diasMarcados.value = [];
}

async function guardarHorario() {
  errors.value = {};
  limpiarMensaje();

  if (
    !grupo.value ||
    !docente.value ||
    !curso.value ||
    !diasMarcados.value.length
  ) {
    mostrarMensaje(
      "Selecciona grupo, docente, curso y al menos un horario.",
      "error",
    );
    return;
  }

  guardando.value = true;

  try {
    const getVal = (v: any) =>
      typeof v === "object" && v !== null ? v.value : v;
    const response = await api.guardarHorario({
      grupo_aula: getVal(grupo.value),
      docente: getVal(docente.value),
      carga: getVal(curso.value),
      horario: diasMarcados.value,
    });

    if (response.status) {
      mostrarMensaje(
        response.message || "Horario guardado correctamente.",
        "success",
      );
      await changeGrupo();
      await changeDocente();
      curso.value = null;
      colorCurso.value = "";
      diasMarcados.value = [];
    } else {
      mostrarMensaje(
        response.message || "No se pudo guardar el horario.",
        "error",
      );
    }
  } catch (error: any) {
    if (error?.data?.errors) {
      errors.value = error.data.errors;
    }
    mostrarMensaje(
      error?.data?.message || "No se pudo guardar el horario.",
      "error",
    );
  } finally {
    guardando.value = false;
  }
}

async function quitarDocente(cargaId: number, docenteId: number) {
  const ok = window.confirm(
    "¿Está seguro de desmatricular el docente del curso?",
  );
  if (!ok) return;

  try {
    const response = await api.desmatricularDocente({
      docente: docenteId,
      carga: cargaId,
    });

    if (response.status) {
      mostrarMensaje(
        response.message || "Docente desmatriculado correctamente.",
        "success",
      );
      await changeGrupo();
      await changeDocente();
      curso.value = null;
      colorCurso.value = "";
      diasMarcados.value = [];
    } else {
      mostrarMensaje(
        response.message || "No se pudo desmatricular al docente.",
        "error",
      );
    }
  } catch (error: any) {
    mostrarMensaje(
      error?.data?.message || "No se pudo desmatricular al docente.",
      "error",
    );
  }
}

async function sincronizarClassroom(cargaId: number, docenteId: number) {
  const ok = window.confirm("¿Está seguro de vincular al ClassRoom?");
  if (!ok) return;

  try {
    const response = await api.vincularDocente({
      docente: docenteId,
      carga: cargaId,
    });

    if (response.status) {
      mostrarMensaje(
        response.message || "Vinculación realizada correctamente.",
        "success",
      );
    } else {
      mostrarMensaje(
        response.message || "No se pudo vincular al ClassRoom.",
        "error",
      );
    }
  } catch (error: any) {
    mostrarMensaje(
      error?.data?.message || "No se pudo vincular al ClassRoom.",
      "error",
    );
  }
}

watch([area, turno, sede], async () => {
  await cargarGrupos();
});

watch(grupo, async () => {
  await changeGrupo();
});

watch([docente, turno], async () => {
  if (docente.value) {
    await changeDocente();
  } else {
    limpiarDisponibilidad();
  }
});

onMounted(async () => {
  await cargarInicial();
  await cargarGrupos();
});

const emit = defineEmits<{
  (e: "refresh"): void
}>()

</script>

<template>
  <div class="relative space-y-6 p-4 md:p-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <h1 class="text-xl font-bold">Gestión de Horario</h1>
          <UBadge v-if="cargandoInicial" color="primary" variant="soft">
            Cargando...
          </UBadge>
        </div>
      </template>

      <div
        v-if="mensaje"
        class="mb-4 rounded-lg border px-4 py-3 text-sm"
        :class="
          mensajeTipo === 'success'
            ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
            : mensajeTipo === 'error'
              ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
              : 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-semibold">
              {{
                mensajeTipo === "success"
                  ? "Correcto"
                  : mensajeTipo === "error"
                    ? "Error"
                    : "Información"
              }}
            </div>
            <div>{{ mensaje }}</div>
          </div>
          <button
            type="button"
            class="text-current/70 hover:text-current"
            @click="limpiarMensaje"
          >
            ×
          </button>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <UFormField label="Área" icon="i-lucide-layers">
          <USelect
            v-model="area"
            :items="areasOpciones"
            value-attribute="value"
            option-attribute="label"
            placeholder="Seleccionar Área"
            icon="i-lucide-layers"
            class="w-full"
            :disabled="cargandoInicial"
            :loading="cargandoInicial"
          />
        </UFormField>

        <UFormField label="Turno" icon="i-lucide-clock">
          <USelect
            v-model="turno"
            :items="turnosOpciones"
            value-attribute="value"
            option-attribute="label"
            placeholder="Seleccionar Turno"
            icon="i-lucide-clock"
            class="w-full"
            :disabled="cargandoInicial"
            :loading="cargandoInicial"
          />
        </UFormField>

        <UFormField label="Sede" icon="i-lucide-map-pin">
          <USelect
            v-model="sede"
            :items="sedesOpciones"
            value-attribute="value"
            option-attribute="label"
            placeholder="Seleccionar Sede"
            icon="i-lucide-map-pin"
            class="w-full"
            :disabled="cargandoInicial"
            :loading="cargandoInicial"
          />
        </UFormField>

        <UFormField label="Grupo / Aula" icon="i-lucide-users">
          <USelect
            v-model="grupo"
            :items="gruposOpciones"
            value-attribute="value"
            option-attribute="label"
            placeholder="Seleccionar Grupo"
            icon="i-lucide-users"
            class="w-full"
            :disabled="cargandoGrupos || cargandoInicial"
            :loading="cargandoGrupos || cargandoInicial"
          />
        </UFormField>
      </div>

      <div class="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
        <UFormField
          label="Buscar y Seleccionar Docente"
          icon="i-lucide-user-check"
        >
          <USelectMenu
            v-model="docente"
            :items="docentesOpciones"
            value-attribute="value"
            option-attribute="label"
            placeholder="Buscar por nombre o DNI..."
            icon="i-lucide-search"
            :disabled="cargandoDisponibilidad || cargandoInicial"
            :loading="cargandoDisponibilidad || cargandoInicial"
            :searchable="true"
            :clearable="true"
            class="w-full"
          >
            <template #leading>
              <UIcon
                name="i-lucide-user-search"
                class="h-4 w-4 text-gray-400"
              />
            </template>
          </USelectMenu>
        </UFormField>
      </div>
    </UCard>

    <div class="grid gap-6 xl:grid-cols-2" >
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">Horario</h2>
            <UBadge
              v-if="cargandoCargas || cargandoGrupos"
              color="primary"
              variant="soft"
            >
              Actualizando...
            </UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <div class="overflow-x-auto border border-default">
            <table class="min-w-full border-collapse text-sm">
              <thead>
                <tr class="bg-blue-100 dark:bg-blue-900/30">
                  <th class="border px-3 py-2">Curso</th>
                  <th class="border px-3 py-2">Marcar</th>
                  <th class="border px-3 py-2">Docente</th>
                  <th class="border px-3 py-2">Acción</th>
                  <th class="border px-3 py-2">Tipo</th>
                  <th class="border px-3 py-2">Estado</th>
                  <th class="border px-3 py-2">ClassRoom</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="carga in cargas" :key="carga.id">
                  <td
                    class="border px-3 py-2"
                    :style="{
                      background:
                        String(carga.tipo) === '1'
                          ? carga.curso?.color || ''
                          : '',
                    }"
                  >
                    {{ carga.curso?.denominacion }}
                  </td>

                  <td class="border px-3 py-2 text-center">
                    <input
                      v-if="String(carga.tipo) === '1'"
                      :checked="curso === carga.id"
                      type="radio"
                      name="curso"
                      @change="seleccionarCurso(carga)"
                    />
                  </td>

                  <td class="border px-3 py-2">
                    <template v-if="carga.docente">
                      {{ carga.docente.paterno }} {{ carga.docente.materno }}
                      {{ carga.docente.nombres }}
                    </template>
                  </td>

                  <td class="border px-3 py-2 text-center">
                    <UButton
                      v-if="carga.docente && String(carga.tipo) === '1'"
                      color="error"
                      variant="soft"
                      size="xs"
                      icon="i-lucide-x"
                      @click="quitarDocente(carga.id, carga.docente.id)"
                    />
                  </td>

                  <td class="border px-3 py-2">
                    <template v-if="carga.docente">
                      {{
                        String(carga.tipo) === "1" ? "Principal" : "Suplente"
                      }}
                    </template>
                  </td>

                  <td class="border px-3 py-2">
                    <template v-if="carga.docente">
                      <UBadge
                        :color="
                          String(carga.estado) === '1' ? 'success' : 'error'
                        "
                        variant="soft"
                      >
                        {{
                          String(carga.estado) === "1" ? "Activo" : "Inactivo"
                        }}
                      </UBadge>
                    </template>
                  </td>

                  <td class="border px-3 py-2 text-center">
                    <UButton
                      v-if="carga.docente"
                      color="primary"
                      variant="soft"
                      size="xs"
                      icon="i-lucide-refresh-cw"
                      @click="sincronizarClassroom(carga.id, carga.docente.id)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="errors.carga" class="text-sm text-red-500">
            {{ errors.carga[0] }}
          </p>

          <HorarioGrupoEditable
            :horarios="horariosGrupo"
            :curso-id="curso"
            :color="colorCurso"
            :model-value="diasMarcados"
            :titulo="`Horario ${turnoGrupo}`"
            @update:model-value="diasMarcados = $event"
          />

          <p v-if="errors.horario" class="text-sm text-red-500">
            {{ errors.horario[0] }}
          </p>

          <UButton
            class="w-full"
            color="success"
            size="xl"
            :loading="guardando"
            @click="guardarHorario"
          >
            Guardar Horario
          </UButton>
        </div>
      </UCard>

      <div class="space-y-6" >
        <HorarioDocenteDisponibilidad
          :horarios="disponibilidadHorario"
          titulo="Horario Docentes"
          :total-horas-ficha="selectedTeacherTotalHours"
          :estado-observaciones="disponibilidadObservaciones"
          @refresh="changeDocente"
        />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold">Cursos por área</h3>
              <UBadge
                v-if="cargandoDisponibilidad"
                color="primary"
                variant="soft"
              >
                Cargando docente...
              </UBadge>
            </div>
          </template>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="item in disponibilidadCursos"
              :key="item.id"
              class="rounded-lg border p-3"
            >
              <div class="mb-2 font-semibold text-primary">
                {{ item.area }}
              </div>

              <ul class="space-y-1 text-sm">
                <li
                  v-for="cursoItem in item.cursos"
                  :key="cursoItem.denominacion"
                >
                  {{ cursoItem.denominacion }}
                </li>
              </ul>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Disponibilidad</h3>
          </template>

          <DisponibilidadDocenteGrid :disponibilidad="disponibilidad" />
        </UCard>
      </div>
    </div>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cargandoDisponibilidad"
        class="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm"
      >
        <div
          class="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-2xl p-6 text-center"
        >
          <div class="flex justify-center mb-4">
            <div
              class="h-14 w-14 rounded-full border-4 border-primary-200 border-t-primary animate-spin"
            ></div>
          </div>

          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            Cargando disponibilidad
          </h3>

          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Actualizando horario, cursos y observaciones del docente...
          </p>

          <div class="mt-5 space-y-2">
            <div class="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div class="h-full w-1/2 rounded-full bg-primary animate-pulse"></div>
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500">
              Esto puede tardar unos segundos
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>
