<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin']
})

import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import type { ObservacionItem } from '#shared/types/seguimientoDocente'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UTooltip = resolveComponent('UTooltip')

const toast = useToast()
const api = useSeguimientoDocenteApi()

type LaravelPagination<T> = {
  current_page: number
  data: T[]
  first_page_url: string | null
  from: number | null
  last_page: number
  last_page_url: string | null
  links: Array<{
    url: string | null
    label: string
    page: number | null
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

const globalFilter = ref('')
const isOpenModal = ref(false)
const selectedObservacion = ref<ObservacionItem | null>(null)
const cargando = ref(false)
const observaciones = ref<ObservacionItem[]>([])
const table: any = useTemplateRef('table')

const page = ref(1)
const perPage = ref(10)

const pagination = ref<LaravelPagination<ObservacionItem>>({
  current_page: 1,
  data: [],
  first_page_url: null,
  from: null,
  last_page: 1,
  last_page_url: null,
  links: [],
  next_page_url: null,
  path: '',
  per_page: 10,
  prev_page_url: null,
  to: null,
  total: 0
})

function normalizarPaginacion(payload: any): LaravelPagination<ObservacionItem> {
  return {
    current_page: Number(payload?.current_page ?? 1),
    data: Array.isArray(payload?.data) ? payload.data : [],
    first_page_url: payload?.first_page_url ?? null,
    from: payload?.from != null ? Number(payload.from) : null,
    last_page: Number(payload?.last_page ?? 1),
    last_page_url: payload?.last_page_url ?? null,
    links: Array.isArray(payload?.links) ? payload.links : [],
    next_page_url: payload?.next_page_url ?? null,
    path: payload?.path ?? '',
    per_page: Number(payload?.per_page ?? 10),
    prev_page_url: payload?.prev_page_url ?? null,
    to: payload?.to != null ? Number(payload.to) : null,
    total: Number(payload?.total ?? 0)
  }
}

function extraerPaginacion(response: any): LaravelPagination<ObservacionItem> {
  console.log('[extraerPaginacion] RESPONSE COMPLETA:', response)

  // Caso 1: axios-like => { success: true, data: { current_page, data: [...] } }
  if (
    response?.data
    && !Array.isArray(response.data)
    && typeof response.data === 'object'
    && 'current_page' in response.data
    && Array.isArray(response.data.data)
  ) {
    console.log('[extraerPaginacion] usando branch: response.data paginado')
    return normalizarPaginacion(response.data)
  }

  // Caso 2: ya viene el objeto paginado directo => { current_page, data: [...] }
  if (
    response
    && !Array.isArray(response)
    && typeof response === 'object'
    && 'current_page' in response
    && Array.isArray(response.data)
  ) {
    console.log('[extraerPaginacion] usando branch: response paginado directo')
    return normalizarPaginacion(response)
  }

  // Caso 3: el servicio devolvió solo array
  if (Array.isArray(response)) {
    console.log('[extraerPaginacion] usando branch: response es array')
    return {
      current_page: 1,
      data: response,
      first_page_url: null,
      from: response.length ? 1 : null,
      last_page: 1,
      last_page_url: null,
      links: [],
      next_page_url: null,
      path: '',
      per_page: response.length || 10,
      prev_page_url: null,
      to: response.length || null,
      total: response.length
    }
  }

  // Caso 4: el servicio devolvió { data: [...] } sin meta
  if (Array.isArray(response?.data)) {
    console.log('[extraerPaginacion] usando branch: response.data es array')
    return {
      current_page: 1,
      data: response.data,
      first_page_url: null,
      from: response.data.length ? 1 : null,
      last_page: 1,
      last_page_url: null,
      links: [],
      next_page_url: null,
      path: '',
      per_page: response.data.length || 10,
      prev_page_url: null,
      to: response.data.length || null,
      total: response.data.length
    }
  }

  console.log('[extraerPaginacion] no se reconoció estructura, devolviendo vacío')
  return {
    current_page: 1,
    data: [],
    first_page_url: null,
    from: null,
    last_page: 1,
    last_page_url: null,
    links: [],
    next_page_url: null,
    path: '',
    per_page: 10,
    prev_page_url: null,
    to: null,
    total: 0
  }
}

function getEstadoColor(estado?: string) {
  const value = (estado || '').toLowerCase()

  if (value.includes('renuncia')) return 'error'
  if (value.includes('sancion')) return 'error'
  if (value.includes('baja')) return 'error'
  if (value.includes('desempe')) return 'warning'
  if (value.includes('investig')) return 'info'
  if (value.includes('document')) return 'primary'

  return 'neutral'
}

function abrirNuevaObservacion() {
  selectedObservacion.value = null
  isOpenModal.value = true
}

const columnMenuItems: any = computed(() => {
  const cols: any = table.value?.tableApi?.getAllColumns?.() ?? []

  return [
    cols
      .filter((col: any) => col.getCanHide())
      .map((col: any) => ({
        label: upperFirst(col.id),
        type: 'checkbox' as const,
        checked: col.getIsVisible(),
        onUpdateChecked: (checked: boolean) => {
          table.value?.tableApi?.getColumn(col.id)?.toggleVisibility(!!checked)
        }
      }))
  ]
})

function getActionItems(row: ObservacionItem) {
  return [
    [
      {
        label: 'Editar Observación',
        icon: 'i-lucide-pencil',
        onSelect() {
          console.log('[acciones] editar observación', row.id)
          selectedObservacion.value = row
          isOpenModal.value = true
        }
      }
    ],
    [
      {
        label: 'Eliminar Observación',
        icon: 'i-lucide-trash',
        onSelect() {
          console.log('[acciones] eliminar observación', row.id)
          eliminarObservacion(row.id)
        }
      }
    ]
  ]
}

async function cargarObservaciones(pageNumber = 1) {
  try {
    cargando.value = true
    console.log('[cargarObservaciones] page solicitada:', pageNumber)

    const response = await api.listarObservaciones({
      page: pageNumber,
      per_page: perPage.value
    })

    console.log('[cargarObservaciones] RAW RESPONSE:', response)

    const parsed = extraerPaginacion(response)

    console.log('[cargarObservaciones] PARSED FINAL:', parsed)
    console.log('[cargarObservaciones] current_page:', parsed.current_page)
    console.log('[cargarObservaciones] last_page:', parsed.last_page)
    console.log('[cargarObservaciones] per_page:', parsed.per_page)
    console.log('[cargarObservaciones] total:', parsed.total)
    console.log('[cargarObservaciones] data length:', parsed.data?.length)

    observaciones.value = parsed.data
    pagination.value = parsed
    page.value = parsed.current_page
    perPage.value = parsed.per_page
  } catch (error) {
    console.error('[cargarObservaciones] ERROR:', error)
    toast.add({
      title: 'Error',
      description: 'No se pudieron cargar las observaciones.',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    cargando.value = false
    console.log('[cargarObservaciones] fin, cargando =', cargando.value)
  }
}

async function eliminarObservacion(id: number) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta observación?')) return

  try {
    cargando.value = true
    const res = await api.eliminarObservacion(id)

    if (res.status === false) {
      throw new Error(res.message || 'Error al eliminar')
    }

    toast.add({
      title: 'Éxito',
      description: res.message || 'Observación eliminada correctamente.',
      color: 'success',
      icon: 'i-lucide-circle-check'
    })

    await cargarObservaciones(page.value)
  } catch (error: any) {
    console.error('[eliminarObservacion] ERROR:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'No se pudo eliminar la observación.',
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  } finally {
    cargando.value = false
  }
}

function puedeIrAAnterior() {
  return pagination.value.current_page > 1
}

function puedeIrASiguiente() {
  return pagination.value.current_page < pagination.value.last_page
}

async function irAPagina(pageNumber: number) {
  console.log('[paginacion] click página:', pageNumber)
  console.log('[paginacion] estado actual:', {
    cargando: cargando.value,
    current_page: pagination.value.current_page,
    last_page: pagination.value.last_page,
    total: pagination.value.total,
    per_page: pagination.value.per_page
  })

  if (cargando.value) {
    console.log('[paginacion] bloqueado: cargando = true')
    return
  }

  if (!pageNumber || pageNumber < 1) {
    console.log('[paginacion] bloqueado: página inválida')
    return
  }

  if (pageNumber > pagination.value.last_page) {
    console.log('[paginacion] bloqueado: pageNumber > last_page')
    return
  }

  if (pageNumber === pagination.value.current_page) {
    console.log('[paginacion] misma página, no hace nada')
    return
  }

  await cargarObservaciones(pageNumber)
}

async function irAnterior() {
  console.log('[paginacion] click anterior')
  await irAPagina(pagination.value.current_page - 1)
}

async function irSiguiente() {
  console.log('[paginacion] click siguiente')
  await irAPagina(pagination.value.current_page + 1)
}

const paginasVisibles = computed(() => {
  const current = pagination.value.current_page || 1
  const last = pagination.value.last_page || 1

  if (last <= 1) return [1]

  const start = Math.max(1, current - 2)
  const end = Math.min(last, current + 2)

  const pages: number[] = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function handleSaved() {
  console.log('[modal] saved, recargando página actual:', page.value)
  cargarObservaciones(page.value)
}

onMounted(() => {
  console.log('[onMounted] cargando observaciones iniciales')
  cargarObservaciones(1)
})

const columns: TableColumn<ObservacionItem>[] = [
  {
    accessorKey: 'id',
    header: '#ID',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'fecha',
    header: 'Fecha'
  },
  {
    accessorKey: 'docente_nombre',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        type: 'button',
        color: 'neutral',
        variant: 'ghost',
        label: 'Docente',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    }
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = (row.getValue('estado') as string) || 'N/A'
      const tipo = (row.original.tipo as string) || ''
      const badgeColor = getEstadoColor(estado)

      return h('div', { class: 'flex flex-col gap-1' }, [
        h(
          UBadge,
          {
            class: 'capitalize w-fit',
            variant: 'subtle',
            color: badgeColor
          },
          () => estado
        ),
        tipo
          ? h(
              'span',
              { class: 'text-[10px] text-gray-500 font-mono tracking-wider ml-1' },
              tipo
            )
          : null
      ])
    }
  },
  {
    accessorKey: 'observacion',
    header: 'Observación',
    cell: ({ row }) => {
      const observacion = (row.getValue('observacion') as string) || '---'

      return h(
        UTooltip,
        {
          text: observacion,
          delayDuration: 150
        },
        () =>
          h(
            'div',
            {
              class:
                'max-w-[320px] truncate text-sm text-gray-700 dark:text-gray-200 cursor-help'
            },
            observacion
          )
      )
    }
  },
  {
    accessorKey: 'curso_nombre',
    header: 'Curso',
    cell: ({ row }) => row.getValue('curso_nombre') || '---'
  },
  {
    accessorKey: 'sede_nombre',
    header: 'Sede / Grupo',
    cell: ({ row }) => {
      const sede = row.getValue('sede_nombre') || '---'
      const grupo = row.original.grupo_nombre || '---'
      return h('span', { class: 'text-sm' }, `${sede} / ${grupo}`)
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    meta: { class: { td: 'text-right' } },
    cell: ({ row }) =>
      h(
        UDropdownMenu,
        {
          content: { align: 'end' },
          items: getActionItems(row.original)
        },
        () =>
          h(UButton, {
            'type': 'button',
            'icon': 'i-lucide-ellipsis-vertical',
            'color': 'neutral',
            'variant': 'ghost',
            'aria-label': 'Acciones'
          })
      )
  }
]
</script>

<template>
  <div class="flex-1 divide-y divide-accented w-full min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
    <div class="flex items-center gap-4 px-6 py-4">
      <div class="flex-1 max-w-md">
        <UInput
          v-model="globalFilter"
          icon="i-lucide-search"
          placeholder="Buscar docente o documento..."
          size="lg"
          variant="subtle"
          color="primary"
          block
        >
          <template
            v-if="globalFilter"
            #trailing
          >
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              icon="i-lucide-x"
              size="xs"
              class="-mr-1.5"
              @click="globalFilter = ''"
            />
          </template>
        </UInput>
      </div>

      <UButton
        type="button"
        label="Registrar observación"
        icon="i-lucide-plus"
        color="primary"
        @click="abrirNuevaObservacion"
      />

      <UDropdownMenu
        :content="{ align: 'end' }"
        :items="columnMenuItems"
      >
        <UButton
          type="button"
          label="Columnas"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
        />
      </UDropdownMenu>
    </div>

    <UTable
      ref="table"
      v-model:global-filter="globalFilter"
      :data="observaciones"
      :columns="columns"
      :loading="cargando"
      loading-color="primary"
      loading-animation="carousel"
      class="h-[calc(100vh-260px)] border-t border-gray-200 dark:border-gray-800"
    >
      <template #expanded="{ row }">
        <div class="p-6 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 shadow-inner">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <p class="text-xs uppercase tracking-widest text-gray-500 mb-2">
                Observación
              </p>
              <p class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {{ row.original.observacion || "---" }}
              </p>
            </div>

            <div class="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <p class="text-xs uppercase tracking-widest text-gray-500 mb-2">
                Detalle
              </p>
              <pre class="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ row.original }}</pre>
            </div>
          </div>
        </div>
      </template>
    </UTable>

    <div class="flex flex-col gap-4 px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
      <div class="text-sm text-gray-500">
        Mostrando
        <span class="font-semibold">{{ pagination.from ?? 0 }}</span>
        -
        <span class="font-semibold">{{ pagination.to ?? 0 }}</span>
        de
        <span class="font-semibold">{{ pagination.total }}</span>
        registros
      </div>

      <div class="flex items-center justify-center gap-2 flex-wrap">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          icon="i-lucide-chevron-left"
          :disabled="!puedeIrAAnterior() || cargando"
          @click="irAnterior"
        >
          Anterior
        </UButton>

        <UButton
          v-for="n in paginasVisibles"
          :key="n"
          type="button"
          :color="n === pagination.current_page ? 'primary' : 'neutral'"
          :variant="n === pagination.current_page ? 'solid' : 'outline'"
          class="min-w-10"
          @click="irAPagina(n)"
        >
          {{ n }}
        </UButton>

        <UButton
          type="button"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-right"
          :disabled="!puedeIrASiguiente() || cargando"
          @click="irSiguiente"
        >
          Siguiente
        </UButton>
      </div>

      <span class="text-xs font-medium text-gray-400 uppercase tracking-widest">
        Vista de Docentes Observados
      </span>
    </div>

    <HorarioSeguimientoModal
      v-model:open="isOpenModal"
      :selected-item="selectedObservacion as any"
      :selected-bloque="(selectedObservacion as any)?.bloque_id"
      :selected-turno="(selectedObservacion as any)?.turno_id"
      @saved="handleSaved"
    />
  </div>
</template>
