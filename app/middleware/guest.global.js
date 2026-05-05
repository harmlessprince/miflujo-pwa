import { useAuthStore } from '~/stores/auth.store'

const GUEST_ONLY_PATHS = ['/']

export default defineNuxtRouteMiddleware(async (to) => {
  if (!GUEST_ONLY_PATHS.includes(to.path)) return

  const authStore = useAuthStore()
  authStore.loadSessionFromStorage()

  if (authStore.isAuthenticated) {
    await authStore.fetchCurrentUser()

    if (authStore.user?.is_active === false) {
      return navigateTo('/inactive')
    }
    return navigateTo('/dashboard')
  }
})
