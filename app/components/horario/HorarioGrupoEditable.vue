<script setup lang="ts">
import { computed } from 'vue'

type Curso = {
  denominacion: string
  color?: string
}

type HorarioItem = {
  id: number
  dia: string | number
  grupo?: string
  sede?: string
  curso?: Curso
}

type HorarioBloque = {
  id?: number
  hora_inicio: string
  hora_fin: string
  horario: HorarioItem[]
}

const props = withDefaults(defineProps<{
  horarios: HorarioBloque[]
  cursoId?: number | string | null
  color?: string
  modelValue?: string[]
  titulo?: string
}>(), {
  titulo: 'Horario'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const dias = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' }
]

const seleccionados = computed({
  get: () => props.modelValue ?? [],
  set: (value: string[]) => emit('update:modelValue', value)
})

function normalizarDia(value: string | number | undefined) {
  return Number(value ?? 0)
}

function celdaOcupada(dia: number, bloque: HorarioBloque) {
  return bloque.horario?.some(item => normalizarDia(item.dia) === dia)
}

function itemPorDia(dia: number, bloque: HorarioBloque) {
  return bloque.horario?.find(item => normalizarDia(item.dia) === dia) ?? null
}

function checkboxValue(dia: number, bloque: HorarioBloque) {
  return `${dia}-${bloque.id ?? ''}-${props.cursoId ?? ''}`
}

function celdaSeleccionada(dia: number, bloque: HorarioBloque) {
  return seleccionados.value.includes(checkboxValue(dia, bloque))
}

function toggleDia(checked: boolean, dia: number, bloque: HorarioBloque) {
  const value = checkboxValue(dia, bloque)

  if (checked) {
    if (!seleccionados.value.includes(value)) {
      seleccionados.value = [...seleccionados.value, value]
    }
    return
  }

  seleccionados.value = seleccionados.value.filter(item => item !== value)
}
</script>

<template>
  <UCard class="shadow-sm">
    <template #header>
      <div class="flex items-center justify-center">
        <h3 class="text-lg font-semibold text-primary">
          {{ titulo }}
        </h3>
      </div>
    </template>

    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse text-sm">
        <thead>
          <tr class="bg-blue-100 dark:bg-blue-900/30">
            <th class="border px-3 py-2 text-left min-w-[120px]">
              Hora
            </th>
            <th
              v-for="dia in dias"
              :key="dia.id"
              class="border px-3 py-2 text-center min-w-[140px]"
            >
              {{ dia.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="bloque in horarios"
            :key="`${bloque.id}-${bloque.hora_inicio}-${bloque.hora_fin}`"
          >
            <th class="border px-3 py-3 text-left bg-gray-50 dark:bg-gray-900/40">
              {{ bloque.hora_inicio }} - {{ bloque.hora_fin }}
            </th>

            <td
              v-for="dia in dias"
              :key="`${bloque.id}-${dia.id}`"
              class="border p-0 align-top"
            >
              <template v-if="celdaOcupada(dia.id, bloque)">
                <div
                  class="min-h-[64px] w-full px-2 py-2 text-white font-medium"
                  :style="{ background: itemPorDia(dia.id, bloque)?.curso?.color || '#475569' }"
                >
                  {{ itemPorDia(dia.id, bloque)?.curso?.denominacion || 'Curso' }}
                </div>
              </template>

              <template v-else>
                <label
                  class="flex min-h-[64px] cursor-pointer items-center justify-center transition"
                  :style="celdaSeleccionada(dia.id, bloque)
                    ? { background: color || '#22c55e' }
                    : { background: 'transparent' }"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="celdaSeleccionada(dia.id, bloque)"
                    @change="toggleDia(($event.target as HTMLInputElement).checked, dia.id, bloque)"
                  >
                </label>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>