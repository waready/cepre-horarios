<script setup lang="ts">
import {
  UButton,
  UBadge,
  UDropdownMenu,
  UIcon,
  UInput,
  UTable,
  UPagination,
  USelect
} from '#components'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import type { HorasDocenteItem } from '#shared/types/horario'

// Interfaz para el docente transformado (alineada con HorasDocenteItem)
interface DocenteTransformed extends HorasDocenteItem {
  loading_horas: boolean
}

const globalFilter = ref('')
const api = useHorarioApi()
const cargando = ref(false)
const rawData = ref<DocenteTransformed[]>([])

// Datos Filtrados (Global)
const filteredData = computed(() => {
  if (!globalFilter.value) return rawData.value
  const filter = globalFilter.value.toLowerCase()
  return rawData.value.filter(
    item =>
      item.dni.toLowerCase().includes(filter)
      || item.nombres_completos.toLowerCase().includes(filter)
      || item.celular?.toLowerCase().includes(filter)
  )
})

const data = computed<DocenteTransformed[]>(() => filteredData.value)

const fetchDocentes = async () => {
  try {
    cargando.value = true
    const response = await api.listarHorasDocentes()

    if (Array.isArray(response)) {
      rawData.value = response.map(item => ({
        ...item,
        loading_horas: false
      }))
    }
  } catch (error) {
    console.error('Error al cargar docentes:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(fetchDocentes)

const columns: TableColumn<DocenteTransformed>[] = [
  {
    accessorKey: 'dni',
    header: 'DNI / Documento',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'font-mono font-medium text-gray-700 dark:text-gray-300' },
        row.getValue('dni')
      )
  },
  {
    accessorKey: 'nombres_completos',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Docente (Apellidos y Nombres)',
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
    accessorKey: 'celular',
    header: 'Celular / Contacto',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-gray-600 dark:text-gray-400' },
        row.getValue('celular')
      )
  },
  {
    accessorKey: 'total_minutos',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Total de horas',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      const totalCalculado = row.original.total_horas || '0h'
      const totalHoras = Number(totalCalculado)
      let badgeColor = 'success'
      if (totalHoras <= 3) {
        badgeColor = 'error'
      } else if (totalHoras <= 15) {
        badgeColor = 'success'
      } else {
        badgeColor = 'warning'
      }

      return h(
        UBadge,
        {
          class: 'capitalize w-28 flex justify-center',
          variant: 'subtle',
          color: badgeColor as any
        },
        () => `${totalCalculado} horas`
      )
    }
  },
  {
    accessorKey: 'cursos_dictados',
    header: 'Cursos Asignados',
    cell: ({ row }) => {
      const cursosStr = row.original.cursos_dictados
      if (!cursosStr)
        return h(
          'span',
          { class: 'text-xs text-gray-400 italic' },
          'Sin cursos'
        )

      const cursos = cursosStr.split(',').map((c: string) => c.trim())

      return h(
        'div',
        { class: 'flex flex-wrap gap-1 max-w-[300px]' },
        cursos.map((c: string) => {
          return h(
            UBadge,
            {
              variant: 'soft',
              color: 'neutral',
              size: 'sm',
              class: 'text-[10px] font-bold border whitespace-nowrap'
            },
            () => c
          )
        })
      )
    }
  },
  {
    accessorKey: 'grupos',
    header: 'Grupos Asignados',
    cell: ({ row }) => {
      const cursosStr = row.original.grupos
      if (!cursosStr)
        return h(
          'span',
          { class: 'text-xs text-gray-400 italic' },
          'Sin grupos'
        )

      const cursos = cursosStr.split(',').map((c: string) => c.trim())

      return h(
        'div',
        { class: 'flex flex-wrap gap-1 max-w-[300px]' },
        cursos.map((c: string) => {
          return h(
            UBadge,
            {
              variant: 'soft',
              color: 'neutral',
              size: 'sm',
              class: 'text-[10px] font-bold border whitespace-nowrap'
            },
            () => c
          )
        })
      )
    }
  },
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        td: 'text-right'
      }
    },
    cell: ({ row }) => {
      const items = [
        {
          label: 'Ver Ficha',
          icon: 'i-lucide-external-link',
          onSelect() {
            console.log('Ver ficha de', row.original.docente_id)
          }
        }
      ]

      return h(
        // @ts-expect-error This is required because UDropdownMenu props are not compatible with h() typings
        UDropdownMenu,
        {
          content: {
            align: 'end'
          },
          items: items as any
        },
        () =>
          h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost'
          })
      )
    }
  }
]

const table = useTemplateRef('table')
</script>

<template>
  <div
    class="flex-1 divide-y divide-accented w-full min-h-screen bg-gray-50/50 dark:bg-gray-950/50"
  >
    <div class="flex items-center gap-4 px-6 py-4">
      <div class="flex-1 max-w-md">
        <UInput
          v-model="globalFilter"
          icon="i-lucide-search"
          placeholder="Buscar docente..."
          size="lg"
          variant="subtle"
          color="primary"
          block
          :ui="{
            trailingIcon:
              'cursor-pointer hover:text-gray-900 dark:hover:text-white'
          }"
        >
          <template
            v-if="globalFilter"
            #trailing
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="xs"
              class="-mr-1.5"
              @click="globalFilter = ''"
            />
          </template>
        </UInput>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <UButton
          icon="i-lucide-refresh-ccw"
          color="neutral"
          variant="outline"
          :loading="cargando"
          @click="fetchDocentes"
        />

        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => ({
                label: upperFirst(column.id),
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi
                    ?.getColumn(column.id)
                    ?.toggleVisibility(!!checked);
                },
                onSelect(e: Event) {
                  e.preventDefault();
                }
              }))
          "
          :content="{ align: 'end' }"
        >
          <UButton
            label="Columnas"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
            aria-label="Seleccionar columnas"
          />
        </UDropdownMenu>
      </div>
    </div>

    <UTable
      ref="table"
      :loading="cargando"
      loading-color="primary"
      loading-animation="carousel"
      :data="data"
      :columns="columns"
      sticky
      class="h-[calc(100vh-270px)] border-t border-gray-200 dark:border-gray-800"
    >
      <template
        v-if="false"
        #expanded="{ row }"
      >
        <div
          class="p-6 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 shadow-inner"
        >
          <!-- Contenido adicional si fuera necesario -->
        </div>
      </template>
    </UTable>

    <div
      class="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 gap-4"
    >
      <div class="text-sm text-gray-500 order-2 md:order-1">
        Mostrando {{ filteredData.length }} docentes
      </div>

      <div class="hidden lg:flex items-center gap-2 order-3">
        <span
          class="text-xs font-medium text-gray-400 uppercase tracking-widest"
        >Padron General de Docentes</span>
      </div>
    </div>
  </div>
</template>
