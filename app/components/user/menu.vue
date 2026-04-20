<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
]
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const { user: sessionUser, logout } = useAuthApi()

const userName = computed(() => {
  return (sessionUser.value as any).name || 'Usuario'
})

const user = computed(() => ({
  name: userName.value,
  avatar: {
    src: 'https://img.freepik.com/vector-premium/ilustracion-plana-vectorial-escala-grises-icono-perfil-usuario-avatar-persona-imagen-perfil-silueta-genero-neutral-apto-perfiles-redes-sociales-iconos-protectores-pantalla-como-plantillax9xa_719432-2191.jpg?semt=ais_hybrid&w=740&q=80',
    alt: userName.value
  }
}))

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: userName.value,
      avatar: user.value.avatar
    }
  ],
  [
    {
      label: 'Mi perfil',
      icon: 'i-lucide-user'
    },
    {
      label: 'Configuración',
      icon: 'i-lucide-settings',
      to: '/settings'
    }
  ],
  [
    {
      label: 'Cerrar sesión',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await logout()
      }
    }
  ],
  [
    {
      label: 'Tema',
      icon: 'i-lucide-palette',
      children: [
        {
          label: 'Primary',
          slot: 'chip',
          chip: appConfig.ui.colors.primary,
          content: {
            align: 'center',
            collisionPadding: 16
          },
          children: colors.map(color => ({
            label: color,
            chip: color,
            slot: 'chip',
            checked: appConfig.ui.colors.primary === color,
            type: 'checkbox',
            onSelect: (e) => {
              e.preventDefault()

              appConfig.ui.colors.primary = color
            }
          }))
        },
        {
          label: 'Neutral',
          slot: 'chip',
          chip:
            appConfig.ui.colors.neutral === 'neutral'
              ? 'old-neutral'
              : appConfig.ui.colors.neutral,
          content: {
            align: 'end',
            collisionPadding: 16
          },
          children: neutrals.map(color => ({
            label: color,
            chip: color === 'neutral' ? 'old-neutral' : color,
            slot: 'chip',
            type: 'checkbox',
            checked: appConfig.ui.colors.neutral === color,
            onSelect: (e) => {
              e.preventDefault()

              appConfig.ui.colors.neutral = color
            }
          }))
        }
      ]
    },
    {
      label: 'Apariencia',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Light',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()

            colorMode.preference = 'light'
          }
        },
        {
          label: 'Dark',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = 'dark'
            }
          },
          onSelect(e: Event) {
            e.preventDefault()
          }
        }
      ]
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)'
    }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
