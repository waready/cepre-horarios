<script setup lang="ts">
import type {
  HorarioItem,
  HorarioBloque,
  HorarioTurno,
  Carga
} from '#shared/types/horario'
import type { GuardarSeguimientoPayload } from '#shared/types/seguimientoDocente'

const props = defineProps<{
  selectedItem: HorarioItem | null | undefined
  selectedBloque: HorarioBloque | null | undefined
  selectedTurno: HorarioTurno | null | undefined
}>()

const emit = defineEmits(['saved'])

const isOpen = defineModel<boolean>('open', { required: true })

const toast = useToast()
const isLoadingSeguimiento = ref(false)
const { guardarSeguimiento, actualizarObservacion, listarObservaciones } = useSeguimientoDocenteApi()
const horarioApi = useHorarioApi()
const { user } = useAuthApi()
const historial = ref<any[]>([])
const isLoadingHistorial = ref(false)
const sedes = ref<any[]>([])
const grupos = ref<any[]>([])
const cargas = ref<Carga[]>([])
const docentes = ref<Array<{ id: number, text: string }>>([])
const isLoadingOpciones = ref(false)
const isLoadingGrupos = ref(false)
const isLoadingCursos = ref(false)

const isAdmin = computed(() => {
  const roles = (user.value as any).roles || []
  return roles.includes('Administrador')
})

const isEdit = computed(() => {
  const item = props.selectedItem as any
  // Solo un objeto que ya es una observación tiene la propiedad 'observacion' definida en su raíz.
  // Los ítems del horario (HorarioItem) no tienen esta propiedad.
  return (
    !!item?.id && Object.prototype.hasOwnProperty.call(item, 'observacion')
  )
})

const isManualCreate = computed(() => !props.selectedItem && !isEdit.value)

const estadoOpciones = [
  { label: 'Documentación', value: 'Documentacion', tipo: 'Administrativo' },
  { label: 'Desempeño', value: 'Desempeño', tipo: 'Pedagógico' },
  { label: 'Investigación', value: 'Investigacion', tipo: 'Disciplinario' },
  { label: 'Sanción', value: 'Sancion', tipo: 'Disciplinario' },
  { label: 'Renuncia', value: 'Renuncia', tipo: 'Desvinculación' },
  { label: 'Baja', value: 'Baja', tipo: 'Desvinculación' }
]

const formSeguimiento = ref({
  fecha: new Date().toISOString().split('T')[0],
  observacion: '',
  estado: estadoOpciones[0]?.value || ''
})

const formManual = ref<any>({
  sede: undefined,
  grupo: undefined,
  curso: undefined,
  docente: undefined
})

const turnoManual = ref<{ id: number, denominacion: string } | null>(null)

const getVal = (value: any) =>
  typeof value === 'object' && value !== null ? value.value : value

const sedesOpciones = computed(() =>
  sedes.value.map(item => ({
    label: item.denominacion || item.text || `Sede ${item.id}`,
    value: item.id
  }))
)

const gruposOpciones = computed(() =>
  grupos.value.map((item: any) => ({
    label: item.grupo?.denominacion || item.grupo || item.denominacion || `Grupo ${item.id}`,
    value: item.id
  }))
)

const cursosOpciones = computed(() =>
  cargas.value.map(carga => ({
    label: carga.curso,
    value: carga.id
  }))
)

const docentesOpciones = computed(() =>
  docentes.value.map(item => ({
    label: item.text,
    value: item.id
  }))
)

const selectedSedeOption = computed(() =>
  sedesOpciones.value.find(item => Number(item.value) === Number(getVal(formManual.value.sede)))
)

const selectedGrupoOption = computed(() =>
  gruposOpciones.value.find(item => Number(item.value) === Number(getVal(formManual.value.grupo)))
)

const selectedDocenteOption = computed(() =>
  docentesOpciones.value.find(item => Number(item.value) === Number(getVal(formManual.value.docente)))
)

const selectedCarga = computed(() =>
  cargas.value.find(carga => Number(carga.id) === Number(getVal(formManual.value.curso)))
)

const manualCompleto = computed(() => {
  if (!isManualCreate.value) return true

  return Boolean(
    getVal(formManual.value.sede)
    && getVal(formManual.value.grupo)
    && getVal(formManual.value.curso)
    && getVal(formManual.value.docente)
  )
})

const isSubmitDisabled = computed(() =>
  isLoadingSeguimiento.value
  || !formSeguimiento.value.observacion.trim()
  || !manualCompleto.value
)

function resetManualForm() {
  formManual.value = {
    sede: undefined,
    grupo: undefined,
    curso: undefined,
    docente: undefined
  }
  grupos.value = []
  cargas.value = []
  turnoManual.value = null
}

async function cargarOpcionesRegistro() {
  try {
    isLoadingOpciones.value = true
    const [sedesRes, docentesRes] = await Promise.all([
      horarioApi.getSedes(),
      horarioApi.getDocentes()
    ])

    sedes.value = sedesRes || []
    docentes.value = docentesRes || []
  } catch (error: any) {
    console.error('Error al cargar opciones de observación:', error)
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'No se pudieron cargar las opciones del formulario.',
      color: 'error'
    })
  } finally {
    isLoadingOpciones.value = false
  }
}

async function cargarGruposRegistro() {
  const sedeId = getVal(formManual.value.sede)

  formManual.value.grupo = undefined
  formManual.value.curso = undefined
  grupos.value = []
  cargas.value = []
  turnoManual.value = null

  if (!sedeId) return

  try {
    isLoadingGrupos.value = true
    grupos.value = await horarioApi.getGrupoAulas({
      sede: Number(sedeId)
    })
  } catch (error: any) {
    console.error('Error al cargar grupos:', error)
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'No se pudieron cargar los grupos.',
      color: 'error'
    })
  } finally {
    isLoadingGrupos.value = false
  }
}

async function cargarCursosRegistro() {
  const grupoId = getVal(formManual.value.grupo)

  formManual.value.curso = undefined
  cargas.value = []
  turnoManual.value = null

  if (!grupoId) return

  try {
    isLoadingCursos.value = true
    const response = await horarioApi.getCargaAcademica(Number(grupoId))
    cargas.value = response.cargaAcademica || []
    turnoManual.value = response.turno || null
  } catch (error: any) {
    console.error('Error al cargar cursos:', error)
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'No se pudieron cargar los cursos del grupo.',
      color: 'error'
    })
  } finally {
    isLoadingCursos.value = false
  }
}

async function cargarHistorial() {
  const item = props.selectedItem as any
  if (!item) return

  const targetHorarioId = item.legacy_horario_id || item.id
  try {
    isLoadingHistorial.value = true
    const response = (await listarObservaciones()) as any

    let allObs: any[] = []
    if (Array.isArray(response)) allObs = response
    else if (Array.isArray(response.data)) allObs = response.data
    else if (Array.isArray(response.data?.data)) allObs = response.data.data

    historial.value = allObs.filter(
      obs => obs.legacy_horario_id === targetHorarioId
    )
  } catch (error) {
    console.error('Error al cargar historial:', error)
  } finally {
    isLoadingHistorial.value = false
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    responseSeguimiento.value = null
    cargarHistorial()
    if (isEdit.value) {
      const item = props.selectedItem as any
      formSeguimiento.value.observacion = item.observacion || ''
      formSeguimiento.value.fecha = item.fecha || new Date().toISOString().split('T')[0]
      formSeguimiento.value.estado = item.estado || estadoOpciones[0]?.value || ''
    } else {
      formSeguimiento.value.observacion = ''
      formSeguimiento.value.fecha = new Date().toISOString().split('T')[0]
      formSeguimiento.value.estado = estadoOpciones[0]?.value || ''
      if (isManualCreate.value) {
        resetManualForm()
        cargarOpcionesRegistro()
      }
    }
  }
})

watch(
  () => formManual.value.sede,
  async () => {
    if (!isOpen.value || !isManualCreate.value) return
    await cargarGruposRegistro()
  }
)

watch(
  () => formManual.value.grupo,
  async () => {
    if (!isOpen.value || !isManualCreate.value) return
    await cargarCursosRegistro()
  }
)
const payloadSeguimiento = computed(() => {
  const item = props.selectedItem as any
  const legacyAuthId = (user.value as any).remote_id
  const estadoObj = estadoOpciones.find(o => o.value === formSeguimiento.value.estado)

  if (!item && isManualCreate.value) {
    if (!manualCompleto.value) return null

    return {
      fecha: formSeguimiento.value.fecha,
      legacy_docente_id: getVal(formManual.value.docente),
      legacy_turno_id: turnoManual.value?.id,
      legacy_carga_academica_id: getVal(formManual.value.curso),
      legacy_grupo_aula_id: getVal(formManual.value.grupo),
      legacy_curso_id: selectedCarga.value?.curso?.id,
      docente_nombre: selectedDocenteOption.value?.label,
      curso_nombre: selectedCarga.value?.curso?.denominacion || cursosOpciones.value.find(item => Number(item.value) === Number(getVal(formManual.value.curso)))?.label,
      grupo_nombre: selectedGrupoOption.value?.label,
      sede_nombre: selectedSedeOption.value?.label,
      observacion: formSeguimiento.value.observacion,
      tipo: estadoObj?.tipo || 'Seguimiento',
      estado: estadoObj?.value,
      legacy_auth_id: legacyAuthId,
      legacy_horario_id: selectedCarga.value.cursos_id
    }
  }

  if (!item) return null

  const docenteInfo = item?.carga?.docente

  const legacyDocenteId = item?.legacy_docente_id || docenteInfo?.id
  const selectedTurnoId
    = typeof props.selectedTurno === 'object' && props.selectedTurno !== null
      ? props.selectedTurno?.id
      : props.selectedTurno
  const legacyTurnoId = item?.legacy_turno_id || selectedTurnoId
  const legacyCargaId = item?.legacy_carga_academica_id || item?.carga?.id
  const legacyHorarioId = item?.legacy_horario_id || item?.id
  const legacyCursoId = item?.legacy_curso_id || item?.curso?.id

  const docenteNombreCompleto = docenteInfo
    ? `${docenteInfo.nombres || ''} ${docenteInfo.paterno || ''} ${docenteInfo.materno || ''}`.trim()
    : item?.docente_nombre

  return {
    fecha: formSeguimiento.value.fecha,
    legacy_docente_id: legacyDocenteId,
    legacy_turno_id: legacyTurnoId,
    legacy_carga_academica_id: legacyCargaId,
    legacy_horario_id: legacyHorarioId,
    legacy_curso_id: legacyCursoId,
    docente_nombre: docenteNombreCompleto,
    curso_nombre: item?.curso?.denominacion || item?.curso_nombre,
    grupo_nombre: item?.grupo || item?.grupo_nombre,
    sede_nombre: item?.sede || item?.sede_nombre,
    dia: Number(item?.dia),
    hora_inicio: props.selectedBloque?.hora_inicio || item?.hora_inicio,
    hora_fin: props.selectedBloque?.hora_fin || item?.hora_fin,
    observacion: formSeguimiento.value.observacion,
    tipo: estadoObj?.tipo || 'Seguimiento',
    estado: estadoObj?.value,
    legacy_auth_id: legacyAuthId
  }
})

const responseSeguimiento = ref<any>(null)

async function submitSeguimiento() {
  if (!payloadSeguimiento.value || !formSeguimiento.value.observacion) {
    console.warn('Submit abortado: Falta payload o observación', {
      payload: payloadSeguimiento.value,
      observacion: formSeguimiento.value.observacion
    })
    toast.add({
      title: 'Formulario incompleto',
      description: isManualCreate.value
        ? 'Selecciona docente, sede, grupo, curso y escribe la observación.'
        : 'Escribe la observación antes de guardar.',
      color: 'warning'
    })
    return
  }
  isLoadingSeguimiento.value = true
  responseSeguimiento.value = null

  console.log('Iniciando envío de observación:', {
    modo: isEdit.value ? 'EDICIÓN (PUT)' : 'REGISTRO (POST)',
    payload: payloadSeguimiento.value
  })

  try {
    let res
    if (isEdit.value) {
      res = await actualizarObservacion(
        (props.selectedItem as any).id,
        payloadSeguimiento.value as unknown as GuardarSeguimientoPayload
      )
    } else {
      res = await guardarSeguimiento(
        payloadSeguimiento.value as unknown as GuardarSeguimientoPayload
      )
    }
    responseSeguimiento.value = res
    toast.add({
      title: 'Éxito',
      description: isEdit.value
        ? 'Observación actualizada correctamente'
        : 'Observación enviada correctamente',
      color: 'success'
    })
    emit('saved', res)
    if (!isEdit.value) {
      formSeguimiento.value.observacion = ''
    }
    await cargarHistorial()
  } catch (error: any) {
    console.error(error)
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'Hubo un error al enviar',
      color: 'error'
    })
  } finally {
    isLoadingSeguimiento.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Detalles del seguimiento"
    scrollable
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
  >
    <template #body>
      <div
        v-if="selectedItem || isManualCreate"
        class="space-y-4"
      >
        <template v-if="selectedItem">
          <div v-if="(selectedItem as any).carga?.docente || (selectedItem as any).docente_nombre">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Docente
            </h4>
            <p class="text-base text-gray-900 dark:text-gray-100">
              <template v-if="(selectedItem as any).carga?.docente">
                {{ (selectedItem as any).carga.docente.nombres }}
                {{ (selectedItem as any).carga.docente.paterno }}
                {{ (selectedItem as any).carga.docente.materno }}
              </template>
              <template v-else>
                {{ (selectedItem as any).docente_nombre }}
              </template>
            </p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Curso
              </h4>
              <p class="text-base font-semibold text-gray-900 dark:text-gray-100">
                {{
                  (selectedItem as any).curso?.denominacion
                    || (selectedItem as any).curso_nombre
                    || "N/A"
                }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sede
              </h4>
              <p class="text-base text-gray-900 dark:text-gray-100">
                {{ (selectedItem as any).sede || (selectedItem as any).sede_nombre || "N/A" }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Grupo
              </h4>
              <p class="text-base text-gray-900 dark:text-gray-100">
                {{ (selectedItem as any).grupo || (selectedItem as any).grupo_nombre || "N/A" }}
              </p>
            </div>
          </div>
        </template>

        <USeparator
          v-if="isAdmin && selectedItem"
          class="my-6"
        />

        <div
          v-if="isAdmin"
          class="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/40 rounded-xl overflow-hidden shadow-sm"
        >
          <div class="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 px-4 py-3 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
            <UIcon
              name="i-lucide-eye"
              class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
            />
            <h4 class="text-sm font-bold text-gray-900 dark:text-emerald-100 tracking-tight">
              {{ isEdit ? "Editar Observación" : "Registrar Observación" }}
            </h4>
          </div>

          <div class="p-4 space-y-4">
            <div
              v-if="isManualCreate"
              class="space-y-4"
            >
              <UFormField label="Buscar y seleccionar docente">
                <USelectMenu
                  v-model="formManual.docente"
                  :items="docentesOpciones"
                  value-attribute="value"
                  option-attribute="label"
                  placeholder="Buscar por nombre o DNI..."
                  icon="i-lucide-search"
                  :disabled="isLoadingOpciones"
                  :loading="isLoadingOpciones"
                  :searchable="true"
                  :clearable="true"
                  class="mt-1 w-full"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-user-search"
                      class="h-4 w-4 text-gray-400"
                    />
                  </template>
                </USelectMenu>
              </UFormField>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UFormField label="Sede">
                  <USelect
                    v-model="formManual.sede"
                    :items="sedesOpciones"
                    value-attribute="value"
                    option-attribute="label"
                    placeholder="Seleccionar sede"
                    icon="i-lucide-map-pin"
                    class="mt-1 w-full"
                    :disabled="isLoadingOpciones"
                    :loading="isLoadingOpciones"
                  />
                </UFormField>

                <UFormField label="Grupo">
                  <USelect
                    v-model="formManual.grupo"
                    :items="gruposOpciones"
                    value-attribute="value"
                    option-attribute="label"
                    placeholder="Seleccionar grupo"
                    icon="i-lucide-users"
                    class="mt-1 w-full"
                    :disabled="!formManual.sede || isLoadingGrupos"
                    :loading="isLoadingGrupos"
                  />
                </UFormField>

                <UFormField label="Curso">
                  <USelect
                    v-model="formManual.curso"
                    :items="cursosOpciones"
                    value-attribute="value"
                    option-attribute="label"
                    placeholder="Seleccionar curso"
                    icon="i-lucide-book-open"
                    class="mt-1 w-full"
                    :disabled="!formManual.grupo || isLoadingCursos"
                    :loading="isLoadingCursos"
                  />
                </UFormField>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Fecha de registro">
                <UInput
                  v-model="formSeguimiento.fecha"
                  type="date"
                  icon="i-lucide-calendar"
                  size="md"
                  color="neutral"
                  class="mt-2 w-full block"
                />
              </UFormField>
              <UFormField label="Estado">
                <USelect
                  v-model="formSeguimiento.estado"
                  :items="estadoOpciones"
                  size="md"
                  icon="i-lucide-activity"
                  class="mt-1 flex-1 w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Observación">
              <UTextarea
                v-model="formSeguimiento.observacion"
                placeholder="Ej. El docente llegó tarde, se adelantó tema, etc..."
                :rows="4"
                size="md"
                resize
                class="mt-1 w-full"
              />
            </UFormField>

            <div class="flex items-center justify-end pt-3 mt-4 border-t border-gray-100 dark:border-gray-800 gap-2">
              <UButton
                icon="i-lucide-x"
                label="Cancelar"
                color="neutral"
                variant="outline"
                size="md"
                class="shadow-sm font-bold tracking-wide"
                @click="isOpen = false"
              />
              <UButton
                :icon="isEdit ? 'i-lucide-check' : 'i-lucide-save'"
                :label="isEdit ? 'Actualizar' : 'Guardar'"
                color="primary"
                size="md"
                :loading="isLoadingSeguimiento"
                :disabled="isSubmitDisabled"
                class="shadow-sm font-bold tracking-wide"
                @click="submitSeguimiento"
              />
            </div>

            <UAccordion
              v-if="historial.length > 0"
              :items="[{ label: 'Historial de observaciones', value: 'historial', icon: 'i-lucide-history', slot: 'historial' }]"
              size="sm"
              variant="soft"
              color="neutral"
              class="mt-4"
              default-value="historial"
            >
              <template #historial>
                <div
                  v-if="historial.length > 0 || isLoadingHistorial"
                  class="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800"
                >
                  <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <UIcon
                      name="i-lucide-history"
                      class="w-4 h-4"
                    />
                    <h4 class="text-xs font-bold uppercase tracking-wider">
                      Historial de Seguimiento
                    </h4>
                    <UIcon
                      v-if="isLoadingHistorial"
                      name="i-lucide-loader-2"
                      class="w-3 h-3 animate-spin ml-auto"
                    />
                  </div>

                  <div class="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    <div
                      v-for="obs in historial"
                      :key="obs.id"
                      class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <UBadge
                            size="xs"
                            variant="subtle"
                            :color="obs.tipo === 'Desvinculación' ? 'error' : 'warning'"
                          >
                            {{ obs.estado }}
                          </UBadge>
                          <span class="text-[10px] text-gray-500 font-medium">{{ obs.fecha }}</span>
                        </div>
                        <!-- Opcional: Badge de "Hoy" o similar -->
                      </div>
                      <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{{ obs.observacion }}"
                      </p>
                    </div>
                  </div>
                </div>
              </template>
            </UAccordion>
            <!-- 📜 Historial de Observaciones -->

            <div
              v-if="responseSeguimiento"
              class="mt-4 border border-cyan-500/30 rounded-lg p-3 bg-cyan-500/5"
            >
              <h4 class="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1 flex items-center gap-1">
                <UIcon name="i-heroicons-check-circle-20-solid" /> Respuesta del servidor:
              </h4>
              <div class="overflow-x-auto text-[10px] font-mono text-cyan-700 dark:text-cyan-300">
                <pre>{{ JSON.stringify(responseSeguimiento, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
