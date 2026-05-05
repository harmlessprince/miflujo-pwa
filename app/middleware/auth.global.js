import { useAuthStore } from '~/stores/auth.store'

const PUBLIC_PATHS = ['/', '/onboarding']

async function ensureCurrentUser(authStore) {
  if (!authStore.isAuthenticated) return
  await authStore.fetchCurrentUser()
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  authStore.loadSessionFromStorage()

  if (to.path === '/inactive') {
    if (!authStore.isAuthenticated) return navigateTo('/')
    await ensureCurrentUser(authStore)
    if (authStore.user?.is_active !== false) return navigateTo('/dashboard')
    return
  }

  if (PUBLIC_PATHS.includes(to.path)) return

  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  await ensureCurrentUser(authStore)

  if (authStore.user?.is_active === false) {
    return navigateTo('/inactive')
  }
})
