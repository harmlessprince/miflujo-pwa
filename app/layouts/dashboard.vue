<template>
  <div class="flex flex-col h-screen bg-surface">
    <!-- Header -->
    <header class="bg-white border-b border-grey px-4 py-3 flex items-center justify-between">
      <button class="text-navy" @click="toggleSidebar">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="text-primary font-semibold text-headline-md">MIFLUJO</div>
      <div class="relative" v-if="authStore.user">
        <button
          class="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center text-body-sm font-semibold cursor-pointer"
          @click="profileDropdownOpen = !profileDropdownOpen"
        >
          {{ authStore.user.name?.charAt(0).toUpperCase() || 'U' }}
        </button>

        <!-- Dropdown -->
        <div
          v-if="profileDropdownOpen"
          class="absolute right-0 top-12 w-56 bg-white border border-grey rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-grey">
            <p class="text-body-sm font-semibold text-navy truncate">{{ authStore.user.name }}</p>
            <p class="text-label-caps text-grey truncate">{{ authStore.user.email }}</p>
          </div>
          <button
            class="w-full text-left px-4 py-3 text-body-sm text-error hover:bg-surface transition-colors flex items-center gap-2"
            @click="handleLogout"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
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
        <button
          v-for="item in dashboardSidebarMenu"
          :key="item.key"
          class="block w-full text-left text-body-md text-navy hover:text-primary transition-colors"
          @click="navigateTo(item.pathName); sidebarOpen = false"
        >
          {{ item.name }}
        </button>
      </nav>
    </BaseDrawer>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto pb-24">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-grey flex justify-around items-center h-20 px-4">
      <button
        v-for="navItem in bottomNav"
        :key="navItem.id"
        :class="[
          'flex flex-col items-center justify-center h-20 text-center transition-colors',
          activeNav === navItem.id ? 'text-primary' : 'text-navy'
        ]"
        @click="activeNav = navItem.id; navigateTo(navItem.pathName)"
      >
        <div class="text-2xl mb-1">{{ navItem.icon }}</div>
        <span class="text-label-caps font-bold text-xs">{{ navItem.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const activeNav = ref('dashboard')
const profileDropdownOpen = ref(false)

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
  { id: 'dashboard', label: 'DASHBOARD', icon: '📊', pathName: '/dashboard' },
  { id: 'statements', label: 'STATEMENTS', icon: '📄', pathName: '/statements' },
  { id: 'upload', label: 'UPLOAD', icon: '⬆️', pathName: '/upload' },
  { id: 'ai', label: 'AI', icon: '⚙️', pathName: '/ai' },
]

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
</style>