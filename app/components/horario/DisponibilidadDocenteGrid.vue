<script setup lang="ts">
type Sede = {
  denominacion?: string
}

type DisponibilidadItem = {
  id: number
  dia: string | number
  sede?: Sede
}

type DisponibilidadBloque = {
  hora_inicio: string
  hora_fin: string
  disponibilidad: DisponibilidadItem[]
}

type DisponibilidadTurno = {
  id: number
  turno: string
  disponibilidad: DisponibilidadBloque[]
}

const props = defineProps<{
  disponibilidad: DisponibilidadTurno[]
}>()

const dias = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' }
]

function normalizarDia(value: string | number | undefined) {
  return Number(value ?? 0)
}

function textoSede(items: DisponibilidadItem[], dia: number) {
  const found = items.find(item => normalizarDia(item.dia) === dia)
  return found?.sede?.denominacion || ''
}
</script>

<template>
  <div class="space-y-8">
    <section
      v-for="turno in disponibilidad"
      :key="turno.id"
      class="space-y-3"
    >
      <h4 class="text-center text-primary font-semibold">
        Horario {{ turno.turno }}
      </h4>

      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr class="bg-cyan-100 dark:bg-cyan-900/30">
              <th class="border px-3 py-2 text-left min-w-[120px]">Hora</th>
              <th
                v-for="dia in dias"
                :key="dia.id"
                class="border px-3 py-2 text-center min-w-[120px]"
              >
                {{ dia.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(bloque, idx) in turno.disponibilidad"
              :key="`${turno.id}-${idx}-${bloque.hora_inicio}`"
            >
              <th class="border px-3 py-3 text-left bg-gray-50 dark:bg-gray-900/40">
                {{ bloque.hora_inicio }} - {{ bloque.hora_fin }}
              </th>
              <td
                v-for="dia in dias"
                :key="`${turno.id}-${idx}-${dia.id}`"
                class="border px-3 py-3 text-center"
              >
                {{ textoSede(bloque.disponibilidad, dia.id) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>