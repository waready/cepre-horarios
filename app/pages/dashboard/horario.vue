<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { clear } = useUserSession()
const logout = async () => {
  clear()
  navigateTo('/login')
}

const links = [
  [
    {
      label: 'General',
      icon: 'i-lucide-calendar',
      to: '/dashboard/horario',
      exact: true
    },
    {
      label: 'Observaciones',
      icon: 'i-lucide-users',
      to: '/dashboard/horario/observaciones'
    },
    {
      label: 'Horas de docentes',
      icon: 'i-lucide-clock',
      to: '/dashboard/horario/horas-docentes'
    }
  ],
  [
    // {
    //   label: "Documentation",
    //   icon: "i-lucide-book-open",
    //   to: "https://ui.nuxt.com/docs/getting-started/installation/nuxt",
    //   target: "_blank",
    // },
  ]
] satisfies NavigationMenuItem[][]
</script>

<template>
  <UDashboardPanel
    id="settings"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Horario">
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

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu
          :items="links"
          highlight
          class="-mx-1 flex-1"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div>
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
