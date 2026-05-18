<template>
  <div class="relative mx-auto flex h-svh min-h-svh w-full max-w-[430px] flex-col overflow-hidden bg-surface">
    <!-- Header -->
    <header class="flex h-16 shrink-0 items-center justify-between border-b border-grey bg-white px-4">
      <IconButton icon="menu" label="Open navigation" @click="toggleSidebar" />
      
        <img :src="horizontalLogoSrc" alt="MiFlujo" class="h-8 w-auto max-w-[150px]" />
      
      
      <ClientOnly>
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
              <p class="text-label-caps text-secondary truncate">{{ authStore.user.email }}</p>
            </div>
            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-3 text-left text-body-sm text-navy transition-colors hover:bg-surface"
              @click="goTo('/dashboard/preferences'); profileDropdownOpen = false"
            >
              <span class="material-symbols-outlined text-title-sm" aria-hidden="true">tune</span>
              Preferences
            </button>
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
        <template #fallback>
          <div class="w-10" />
        </template>
      </ClientOnly>
    </header>

    <!-- Sidebar (optional drawer) -->
    <BaseDrawer v-model:open="sidebarOpen" side="left">
      <nav class="p-6 space-y-4">
        <img :src="horizontalLogoSrc" alt="MiFlujo" class="mb-6 h-8 w-auto" />
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

    <button
      v-if="showFloatingUploadButton"
      ref="floatingUploadButton"
      type="button"
      :class="[
        'absolute z-30 flex h-14 touch-none select-none items-center gap-2 rounded-full bg-primary px-4 text-title-sm font-semibold text-white shadow-lg shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isDraggingUploadButton ? 'cursor-grabbing' : 'cursor-grab transition-transform hover:-translate-y-0.5',
      ]"
      :style="floatingUploadButtonStyle"
      aria-label="Upload statement"
      @pointerdown="startUploadButtonDrag"
      @click="handleFloatingUploadClick"
    >
      <span class="material-symbols-outlined text-[22px]" aria-hidden="true">upload_file</span>
      <span>Upload</span>
    </button>

    <BaseDrawer
      v-model:open="preferencesPromptOpen"
      side="bottom"
      content-class="p-0"
    >
      <div class="flex justify-center pb-1 pt-3">
        <div class="h-1 w-10 rounded-full bg-grey/40" />
      </div>
      <div class="border-b border-grey/30 px-5 py-4">
        <div class="mb-2 flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">tune</span>
          <p class="text-label-caps font-bold uppercase text-secondary">Preferences</p>
        </div>
        <h2 class="text-title-sm font-medium text-navy">Complete your setup</h2>
        <p class="mt-1 text-body-sm text-secondary">
          Set your money rhythm, alert style, and privacy level.
        </p>
      </div>

      <div class="space-y-3 px-5 py-4">
        <BaseButton
          class="!h-11"
          type="button"
          @click="openPreferences"
        >
          Set Preferences
        </BaseButton>
        <div class="grid grid-cols-2 gap-3">
          <BaseButton
            variant="outline"
            class="!h-11"
            type="button"
            @click="remindPreferencesLater(7)"
          >
            1 Week
          </BaseButton>
          <BaseButton
            variant="outline"
            class="!h-11"
            type="button"
            @click="remindPreferencesLater(14)"
          >
            2 Weeks
          </BaseButton>
        </div>
      </div>
    </BaseDrawer>

    <!-- Bottom Navigation -->
    <nav class="grid h-[calc(72px+env(safe-area-inset-bottom))] shrink-0 grid-cols-5 items-stretch border-t border-grey bg-white px-2 pb-[env(safe-area-inset-bottom)]">
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
import { usePreferencesStore } from '~/stores/preferences.store.js'

const route = useRoute()
const authStore = useAuthStore()
const preferencesStore = usePreferencesStore()

const sidebarOpen = ref(false)
const profileDropdownOpen = ref(false)
const preferencesPromptDismissed = ref(false)
const floatingUploadButton = ref(null)
const floatingUploadPosition = ref({ right: 16, bottom: 88 })
const isDraggingUploadButton = ref(false)
const uploadDragState = ref(null)
const horizontalLogoSrc = '/horizontal-logo.png'
const activeNav = computed(() => {
  const matchedItem = bottomNav.find((item) => route.path.startsWith(item.pathName))
  return matchedItem?.id || 'dashboard'
})

const preferencesPromptOpen = computed({
  get() {
    return (
      !preferencesPromptDismissed.value &&
      route.path !== '/dashboard/preferences' &&
      preferencesStore.shouldPromptSetup
    )
  },
  set(value) {
    if (!value) preferencesPromptDismissed.value = true
  },
})

const showFloatingUploadButton = computed(() =>
  !preferencesPromptOpen.value &&
  route.path !== '/dashboard/statements/upload'
)

const floatingUploadButtonStyle = computed(() => ({
  right: `${floatingUploadPosition.value.right}px`,
  bottom: `calc(${floatingUploadPosition.value.bottom}px + env(safe-area-inset-bottom))`,
}))

const handleLogout = async () => {
  profileDropdownOpen.value = false
  await authStore.logout()
}

// Sidebar menu
const dashboardSidebarMenu = [
  { key: 'dashboard', name: 'Dashboard', icon: 'dashboard', activeIcon: 'dashboard', pathName: '/dashboard', comingSoon: false },
  { key: 'statements', name: 'Statements', icon: 'description', activeIcon: 'description', pathName: '/dashboard/statements', comingSoon: false },
  { key: 'transactions', name: 'Transactions', icon: 'receipt_long', activeIcon: 'receipt_long', pathName: '/dashboard/transactions', comingSoon: false },
  { key: 'analytics', name: 'Analytics', icon: 'analytics', activeIcon: 'analytics', pathName: '/dashboard/analytics', comingSoon: false },
  { key: 'ai', name: 'AI Assistant', icon: 'smart_toy', activeIcon: 'smart_toy', pathName: '/dashboard/ai', comingSoon: false },
]

// Bottom navigation
const bottomNav = [
  { id: 'dashboard', label: 'HOME', icon: 'dashboard', activeIcon: 'dashboard', pathName: '/dashboard' },
  { id: 'statements', label: 'STATEMENTS', icon: 'description', activeIcon: 'description', pathName: '/dashboard/statements' },
  { id: 'transactions', label: 'TXNS', icon: 'receipt_long', activeIcon: 'receipt_long', pathName: '/dashboard/transactions' },
  { id: 'analytics', label: 'ANALYTICS', icon: 'analytics', activeIcon: 'analytics', pathName: '/dashboard/analytics' },
  { id: 'ai', label: 'AI', icon: 'smart_toy', activeIcon: 'smart_toy', pathName: '/dashboard/ai' },
]

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const goTo = (path) => {
  navigateTo(path)
}

function pointerPoint(event) {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

function clampUploadButtonPosition(nextRight, nextBottom) {
  if (!import.meta.client) return { right: nextRight, bottom: nextBottom }

  const button = floatingUploadButton.value
  const parent = button?.offsetParent
  if (!button || !parent) return { right: nextRight, bottom: nextBottom }

  const margin = 12
  const maxRight = Math.max(margin, parent.clientWidth - button.offsetWidth - margin)
  const maxBottom = Math.max(88, parent.clientHeight - button.offsetHeight - margin)

  return {
    right: Math.min(Math.max(nextRight, margin), maxRight),
    bottom: Math.min(Math.max(nextBottom, 88), maxBottom),
  }
}

function startUploadButtonDrag(event) {
  if (event.button !== 0) return
  const point = pointerPoint(event)
  isDraggingUploadButton.value = false
  uploadDragState.value = {
    pointerId: event.pointerId,
    startX: point.x,
    startY: point.y,
    startRight: floatingUploadPosition.value.right,
    startBottom: floatingUploadPosition.value.bottom,
    moved: false,
  }
  floatingUploadButton.value?.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', moveUploadButton)
  window.addEventListener('pointerup', stopUploadButtonDrag)
  window.addEventListener('pointercancel', stopUploadButtonDrag)
}

function moveUploadButton(event) {
  const state = uploadDragState.value
  if (!state || event.pointerId !== state.pointerId) return

  const point = pointerPoint(event)
  const deltaX = point.x - state.startX
  const deltaY = point.y - state.startY
  const moved = Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4

  if (moved) {
    state.moved = true
    isDraggingUploadButton.value = true
  }

  const next = clampUploadButtonPosition(
    state.startRight - deltaX,
    state.startBottom - deltaY,
  )
  floatingUploadPosition.value = next
}

function stopUploadButtonDrag(event) {
  const state = uploadDragState.value
  if (state && event.pointerId === state.pointerId) {
    floatingUploadButton.value?.releasePointerCapture?.(event.pointerId)
  }
  window.removeEventListener('pointermove', moveUploadButton)
  window.removeEventListener('pointerup', stopUploadButtonDrag)
  window.removeEventListener('pointercancel', stopUploadButtonDrag)
  setTimeout(() => {
    isDraggingUploadButton.value = false
    uploadDragState.value = null
  }, 0)
}

function handleFloatingUploadClick(event) {
  if (uploadDragState.value?.moved) {
    event.preventDefault()
    return
  }

  goTo('/dashboard/statements/upload')
}

function openPreferences() {
  preferencesPromptDismissed.value = true
  navigateTo('/dashboard/preferences')
}

function remindPreferencesLater(days) {
  preferencesStore.remindLater(days)
  preferencesPromptDismissed.value = true
}

onMounted(() => {
  preferencesStore.fetchPreferences()
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', moveUploadButton)
  window.removeEventListener('pointerup', stopUploadButtonDrag)
  window.removeEventListener('pointercancel', stopUploadButtonDrag)
})
</script>

<style lang="scss" scoped>
</style>
