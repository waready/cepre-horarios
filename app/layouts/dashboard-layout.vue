<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

const items: NavigationMenuItem[][] = [
  [
    {
      label: 'Dashboard Home',
      to: '/dashboard',
      icon: 'i-lucide-house',
      onSelect: () => {
        open.value = false
      },
      exact: true
    },
    {
      label: 'Horario',
      to: '/dashboard/horario',
      icon: 'i-lucide-calendar',
      onSelect: () => {
        open.value = false
      },
      exact: true,
      type: 'trigger',
      children: [
        {
          label: 'Horario',
          to: '/dashboard/horario',
          exact: true,
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Docentes observados',
          to: '/dashboard/horario/observaciones',
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Horas docentes',
          to: '/dashboard/horario/horas-docentes',
          onSelect: () => {
            open.value = false
          }
        }
      ]
    }

    // {
    //   label: "Settings",
    //   to: "/dashboard/settings",
    //   icon: "i-lucide-settings",
    //   defaultOpen: true,
    //   type: "trigger",
    //   children: [
    //     {
    //       label: "General",
    //       to: "/dashboard/settings",
    //       exact: true,
    //       onSelect: () => {
    //         open.value = false;
    //       },
    //     },
    //     {
    //       label: "Members",
    //       to: "/dashboard/settings/members",
    //       onSelect: () => {
    //         open.value = false;
    //       },
    //     },
    //     {
    //       label: "Security",
    //       to: "/dashboard/settings/security",
    //       onSelect: () => {
    //         open.value = false;
    //       },
    //     },
    //   ],
    // },
  ]
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      :ui="{ footer: 'border-t border-default' }"
      class="bg-elevated/25"
    >
      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<style lang="scss" scoped></style>
