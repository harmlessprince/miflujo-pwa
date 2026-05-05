<template>
  <div class="mx-auto flex h-svh min-h-svh w-full max-w-[430px] flex-col overflow-hidden bg-surface">
    <!-- Header -->
    <header class="flex h-16 shrink-0 items-center justify-between border-b border-grey bg-white px-4">
      <IconButton icon="menu" label="Open navigation" @click="toggleSidebar" />
      <img src="/horizontal-logo.png" alt="MiFlujo" class="h-8 w-auto max-w-[150px]" />
      <div class="relative flex w-10 justify-end" v-if="authStore.user">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-body-sm font-semibold text-white transition-colors hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          @click="profileDropdownOpen = !profileDropdownOpen"
        >
          {{ authStore.user.name?.charAt(0).toUpperCase() || 'U' }}
        </button>

        <!-- Dropdown -->
        <div
          v-if="profileDropdownOpen"
          class="absolute right-0 top-12 z-50 w-[min(14rem,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-grey bg-white shadow-lg"
        >
          <div class="px-4 py-3 border-b border-grey">
            <p class="text-body-sm font-semibold text-navy truncate">{{ authStore.user.name }}</p>
            <p class="text-label-caps text-grey truncate">{{ authStore.user.email }}</p>
          </div>
          <button
            type="button"
            class="flex w-full items-center gap-2 px-4 py-3 text-left text-body-sm text-error transition-colors hover:bg-surface"
            @click="handleLogout"
          >
            <span class="material-symbols-outlined text-title-sm" aria-hidden="true">logout</span>
            Logout
          </button>
        </div>

        <!-- Backdrop to close dropdown -->
        <div
          v-if="profileDropdownOpen"
          class="fixed inset-0 z-40"
          @click="profileDropdownOpen = false"
        />
      </div>
    </header>

    <!-- Sidebar (optional drawer) -->
    <BaseDrawer v-model:open="sidebarOpen" side="left">
      <nav class="p-6 space-y-4">
        <img src="/horizontal-logo.png" alt="MiFlujo" class="mb-6 h-8 w-auto" />
        <button
          v-for="item in dashboardSidebarMenu"
          :key="item.key"
          type="button"
          class="flex w-full items-center gap-3 text-left text-body-md text-navy transition-colors hover:text-primary"
          @click="goTo(item.pathName); sidebarOpen = false"
        >
          <span class="material-symbols-outlined text-headline-md" aria-hidden="true">{{ item.icon }}</span>
          {{ item.name }}
        </button>
      </nav>
    </BaseDrawer>

    <!-- Main Content -->
    <main class="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav class="grid h-[calc(72px+env(safe-area-inset-bottom))] shrink-0 grid-cols-4 items-stretch border-t border-grey bg-white px-2 pb-[env(safe-area-inset-bottom)]">
      <button
        v-for="navItem in bottomNav"
        :key="navItem.id"
        :class="[
          'flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-center transition-colors',
          activeNav === navItem.id ? 'text-primary' : 'text-navy'
        ]"
        type="button"
        @click="goTo(navItem.pathName)"
      >
        <span class="material-symbols-outlined text-headline-md" aria-hidden="true">
          {{ activeNav === navItem.id ? navItem.activeIcon : navItem.icon }}
        </span>
        <span class="w-full truncate text-label-caps font-bold">{{ navItem.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const profileDropdownOpen = ref(false)

const activeNav = computed(() => {
  const matchedItem = bottomNav.find((item) => route.path.startsWith(item.pathName))
  return matchedItem?.id || 'dashboard'
})

const handleLogout = async () => {
  profileDropdownOpen.value = false
  await authStore.logout()
}

// Sidebar menu
const dashboardSidebarMenu = [
  { key: 'dashboard', name: 'Dashboard', icon: 'dashboard', activeIcon: 'dashboard', pathName: '/dashboard', comingSoon: false },
  { key: 'statements', name: 'Statements', icon: 'description', activeIcon: 'description', pathName: '/statements', comingSoon: false },
  { key: 'upload', name: 'Upload', icon: 'upload', activeIcon: 'upload', pathName: '/upload', comingSoon: false },
  { key: 'ai', name: 'AI Assistant', icon: 'smart_toy', activeIcon: 'smart_toy', pathName: '/ai', comingSoon: false },
]

// Bottom navigation
const bottomNav = [
  { id: 'dashboard', label: 'DASHBOARD', icon: 'dashboard', activeIcon: 'dashboard', pathName: '/dashboard' },
  { id: 'statements', label: 'STATEMENTS', icon: 'description', activeIcon: 'description', pathName: '/statements' },
  { id: 'upload', label: 'UPLOAD', icon: 'upload', activeIcon: 'upload', pathName: '/upload' },
  { id: 'ai', label: 'AI', icon: 'smart_toy', activeIcon: 'smart_toy', pathName: '/ai' },
]

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const goTo = (path) => {
  navigateTo(path)
}
</script>

<style lang="scss" scoped>
</style>
