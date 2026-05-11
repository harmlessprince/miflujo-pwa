<script setup>
const props = defineProps({
  errorCode: {
    type: String,
    default: 'ERR_CONNECTION_REFUSED',
  },
  timestamp: {
    type: String,
    default: null,
  },
  traceId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['retry', 'back-to-login'])

const displayTimestamp = computed(() => props.timestamp ?? new Date().toISOString())
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface">

    <header class="flex h-16 items-center justify-between border-b border-grey/40 px-6">
      <IconButton icon="arrow_back" label="Go back" @click="emit('back-to-login')" />
      <h1 class="text-headline-md font-semibold">
        <span class="text-primary">Mi</span><span class="text-navy">Flujo</span>
      </h1>
      <IconButton icon="help" label="Help" />
    </header>

    <main class="flex flex-1 flex-col px-6 py-8">
      <section class="mx-auto w-full max-w-sm rounded-[10px] border border-grey/60 bg-white px-6 py-8 shadow-sm space-y-6">

        <div class="flex justify-center">
          <div class="flex h-24 w-24 items-center justify-center rounded-[10px] border-2 border-dashed border-primary/40 bg-primary/5">
            <span class="material-symbols-outlined text-primary" style="font-size: 40px;" aria-hidden="true">wifi_off</span>
          </div>
        </div>

        <div class="text-center space-y-3">
          <h2 class="text-headline-md font-semibold text-navy">Network connection error</h2>
          <p class="text-body-md font-normal text-secondary">
            Check your internet and try again. We couldn't establish a secure connection to the authentication servers.
          </p>
        </div>

        <div class="space-y-3">
          <BaseButton type="button" class="flex items-center justify-center gap-x-2" @click="emit('retry')">
            <span class="material-symbols-outlined text-white text-title-sm" aria-hidden="true">refresh</span>
            <span>Retry</span>
          </BaseButton>
          <BaseButton type="button" variant="outline" @click="emit('back-to-login')">
            Back to Login
          </BaseButton>
        </div>

        <hr class="border-grey/40" />

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-label-caps font-bold uppercase text-navy tracking-widest">System Status</span>
            <div class="flex items-center gap-x-1.5">
              <span class="h-2 w-2 rounded-full bg-error" aria-hidden="true"></span>
              <span class="text-body-sm font-medium text-error">Offline</span>
            </div>
          </div>

          <div class="rounded-[10px] border border-grey/40 bg-surface px-4 py-3 space-y-1">
            <p class="text-data-mono font-medium tabular-nums text-navy">{{ errorCode }}</p>
            <p class="text-data-mono font-medium tabular-nums text-navy/70">Timestamp: {{ displayTimestamp }}</p>
            <p v-if="traceId" class="text-data-mono font-medium tabular-nums text-navy/70">Trace ID: {{ traceId }}</p>
          </div>
        </div>

      </section>
    </main>

    <footer class="px-6 pb-8 space-y-4">
      <p class="text-center text-body-sm font-normal text-navy/70">
        If you continue to experience issues, please contact our support desk or check our
        <a href="#" class="text-primary font-medium hover:underline transition-colors">Service Status</a> page.
      </p>
      <div class="flex items-center justify-center gap-x-2">
        <span class="material-symbols-outlined text-secondary text-body-sm" aria-hidden="true">lock</span>
        <span class="text-label-caps font-bold uppercase text-secondary tracking-widest">MiFlujo Secure Gateway</span>
      </div>
    </footer>

  </div>
</template>
