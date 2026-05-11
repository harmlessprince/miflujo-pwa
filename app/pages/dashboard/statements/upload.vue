<script setup>
import { useBankStatementStore } from '~/stores/bankStatement.store.js'
import { formatToMoney, formatDate, logger } from '~/utils/helpers.js'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Upload Statement — MiFlujo' })

const store = useBankStatementStore()
const { choices, loading, uploadResult } = storeToRefs(store)

// ── State machine ────────────────────────────────────────────────────────────
// 'idle' | 'processing' | 'success' | 'failed'
const uploadStatus = ref('idle')

// ── Form fields ───────────────────────────────────────────────────────────────
const selectedBank = ref('')
const selectedFile = ref(null)
const statementUrl = ref('')
const isDragging = ref(false)
const fileInputRef = ref(null)

// ── Failure state data ────────────────────────────────────────────────────────
const parseWarnings = ref([])
const failureMessage = ref('')

// ── Bank options for SearchableSelectInput ────────────────────────────────────
const bankOptions = computed(() =>
  choices.value.map((c) => ({ label: c.name, value: c.key }))
)

// PROCESS button active only when bank + (file OR url) is set
const canProcess = computed(
  () => !!selectedBank.value && (!!selectedFile.value || !!statementUrl.value.trim())
)

// ── File size formatter (for meta section) ────────────────────────────────────
const fileSize = computed(() => {
  const bytes = uploadResult.value?.file_size_bytes ?? 0
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

// ── Confidence ring SVG helpers (for success state) ───────────────────────────
const confidence = computed(() => uploadResult.value?.parse_confidence ?? 0)
const RING_CIRCUMFERENCE = 251.33 // 2π × 40
const ringOffset = computed(() =>
  RING_CIRCUMFERENCE * (1 - confidence.value / 100)
)

onMounted(() => store.fetchChoices())

// ── File dropzone ─────────────────────────────────────────────────────────────
function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event) {
  const file = event.target?.files?.[0]
  if (file) {
    selectedFile.value = file
    statementUrl.value = ''
  }
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    selectedFile.value = file
    statementUrl.value = ''
  }
}

function clearFile() {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ── Upload action ─────────────────────────────────────────────────────────────
async function processStatement() {
  if (!canProcess.value || uploadStatus.value === 'processing') return

  uploadStatus.value = 'processing'

  const formData = new FormData()
  formData.append('bank_statement_choice', selectedBank.value)
  if (selectedFile.value) {
    formData.append('bank_statement_pdf', selectedFile.value)
  } else {
    formData.append('bank_statement_pdf_url', statementUrl.value.trim())
  }

  const result = await store.uploadStatement(formData)

  if (result.success) {
    uploadStatus.value = 'success'
  } else {
    const errorCode = result.error?.data?.error_code
    if (
      errorCode === 'bank_statement_password_required' ||
      errorCode === 'bank_statement_invalid_password'
    ) {
      // Recoverable — keep file, stay on form
      uploadStatus.value = 'idle'
      logger.warn('Password required for statement:', errorCode)
    } else {
      parseWarnings.value = result.error?.data?.parse_warnings ?? []
      failureMessage.value =
        result.error?.data?.message ??
        "We couldn't parse this statement. The file format may be unsupported or the file is corrupted."
      uploadStatus.value = 'failed'
    }
  }
}

// ── Navigation helpers ────────────────────────────────────────────────────────
function retryUpload() {
  parseWarnings.value = []
  failureMessage.value = ''
  uploadStatus.value = 'idle'
}

function resetAndUploadAnother() {
  selectedBank.value = ''
  selectedFile.value = null
  statementUrl.value = ''
  parseWarnings.value = []
  failureMessage.value = ''
  uploadStatus.value = 'idle'
}
</script>

<template>
  <MobileContainer>

    <!-- ═══════════════════════════════════════════════════════════════════════
         IDLE STATE — Upload form
    ════════════════════════════════════════════════════════════════════════════ -->
    <template v-if="uploadStatus === 'idle' || uploadStatus === 'processing'">
      <div class="px-4 py-6 space-y-6">
        <!-- Heading -->
        <div>
          <h1 class="text-headline-md font-semibold text-navy">Upload Statement</h1>
          <p class="mt-1 text-body-md text-secondary">
            Select your bank and upload your statement file or provide a URL.
          </p>
        </div>

        <!-- Bank / Wallet Selector -->
        <div>
          <label class="mb-2 block text-label-caps font-bold uppercase tracking-widest text-secondary">
            Bank / Wallet
          </label>
          <SearchableSelectInput
            v-model="selectedBank"
            :options="bankOptions"
            placeholder="Choose a financial institution"
            search-placeholder="Search banks..."
          />
        </div>

        <!-- File Dropzone -->
        <div>
          <label class="mb-2 block text-label-caps font-bold uppercase tracking-widest text-secondary">
            File Upload
          </label>

          <!-- Hidden native file input (programmatically triggered) -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".pdf,.csv,.xlsx"
            class="sr-only"
            @change="handleFileSelect"
          />

          <!-- Selected file display -->
          <div
            v-if="selectedFile"
            class="flex items-center justify-between rounded-[10px] border border-primary bg-primary/5 px-4 py-3"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span class="material-symbols-outlined shrink-0 text-primary" aria-hidden="true">description</span>
              <span class="truncate text-body-sm font-medium text-navy">{{ selectedFile.name }}</span>
            </div>
            <button
              type="button"
              class="ml-2 shrink-0 text-secondary transition-colors hover:text-error"
              @click="clearFile"
            >
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
            </button>
          </div>

          <!-- Dropzone -->
          <button
            v-else
            type="button"
            :class="[
              'flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed p-8 text-center transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-grey bg-surface hover:border-primary hover:bg-primary/5',
            ]"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <span
              :class="['material-symbols-outlined text-[36px] transition-colors', isDragging ? 'text-primary' : 'text-secondary']"
              aria-hidden="true"
            >cloud_upload</span>
            <p class="text-body-md text-navy">
              Drag file here or <span class="font-semibold text-primary">click to browse</span>
            </p>
            <p class="text-body-sm text-secondary">PDF, CSV, or XLSX (Max 10MB)</p>
          </button>
        </div>

        <!-- OR Divider -->
        <div class="relative flex items-center">
          <div class="flex-1 border-t border-grey/40" />
          <span class="mx-4 text-label-caps font-bold uppercase tracking-widest text-secondary">or</span>
          <div class="flex-1 border-t border-grey/40" />
        </div>

        <!-- Statement URL -->
        <div>
          <label class="mb-2 block text-label-caps font-bold uppercase tracking-widest text-secondary">
            Statement URL
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-4 z-10 text-secondary">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">link</span>
            </span>
            <input
              v-model="statementUrl"
              type="url"
              placeholder="https://bank.com/secure-link"
              class="h-[47px] w-full rounded-[10px] border border-grey bg-white pl-10 pr-4 text-body-md text-navy placeholder:text-secondary outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
              @input="selectedFile = null"
            />
          </div>
        </div>

        <!-- Password info alert -->
        <div class="flex items-start gap-3 rounded-[10px] border border-warning/30 bg-warning/10 p-3">
          <span class="material-symbols-outlined shrink-0 text-[20px] text-warning" aria-hidden="true">info</span>
          <p class="text-body-sm text-navy">
            Passwords are only required for protected PDFs. You will be prompted if a key is needed.
          </p>
        </div>

        <!-- Process CTA -->
        <BaseButton
          type="button"
          :disabled="!canProcess || uploadStatus === 'processing'"
          @click="processStatement"
        >
          <span class="flex items-center justify-center gap-2">
            <span v-if="uploadStatus === 'processing'" class="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">
              progress_activity
            </span>
            <span>{{ uploadStatus === 'processing' ? 'Processing…' : 'Process Statement' }}</span>
            <span v-if="uploadStatus !== 'processing'" class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
          </span>
        </BaseButton>

        <!-- Secure processing note -->
        <div class="flex items-start gap-3 border-l-4 border-navy bg-white p-4 shadow-sm rounded-r-[10px]">
          <span class="material-symbols-outlined shrink-0 text-navy" aria-hidden="true">verified_user</span>
          <div>
            <p class="text-title-sm font-medium text-navy">Secure Processing</p>
            <p class="mt-1 text-body-sm text-secondary">
              All statements are parsed locally or via encrypted pipelines. We never store raw banking credentials.
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════════════
         SUCCESS STATE — Upload successful
    ════════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="uploadStatus === 'success'">
      <div class="px-4 py-6 space-y-4">
        <!-- Hero -->
        <div class="flex flex-col items-center py-4 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <span
              class="material-symbols-outlined text-[40px] text-success"
              style="font-variation-settings: 'FILL' 1"
              aria-hidden="true"
            >check_circle</span>
          </div>
          <h1 class="text-display-lg font-semibold text-navy">Upload Successful</h1>
          <p class="mt-2 text-body-md text-secondary">
            Your {{ uploadResult?.bank_choice_label ?? 'bank' }} statement has been processed.
            We've mapped your financial data with high accuracy.
          </p>
        </div>

        <!-- Processing entity card -->
        <div class="rounded-[10px] border border-grey bg-white p-4 shadow-sm">
          <div class="mb-3 flex items-center justify-between border-b border-grey/30 pb-3">
            <span class="text-label-caps font-bold uppercase tracking-widest text-secondary">Processing Entity</span>
            <span class="flex items-center gap-1 text-label-caps font-bold text-success">
              <span class="material-symbols-outlined text-[14px]" aria-hidden="true">verified</span>
              VERIFIED
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-body-sm text-secondary">Account</p>
              <p class="text-title-sm font-medium text-navy">
                {{ uploadResult?.account_name ?? 'Account' }}
                {{ uploadResult?.account_number ? `• ${uploadResult.account_number}` : '' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-body-sm text-secondary">Bank</p>
              <p class="text-title-sm font-medium text-navy">{{ uploadResult?.bank_choice_label ?? '—' }}</p>
            </div>
            <div class="col-span-2 border-t border-grey/30 pt-3">
              <p class="text-body-sm text-secondary">Processing Period</p>
              <div class="mt-1 flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">calendar_today</span>
                <p class="text-data-mono font-medium tabular-nums text-navy">
                  {{ uploadResult?.start_date ?? '' }} – {{ uploadResult?.end_date ?? '' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Parse Confidence Ring -->
        <div class="flex flex-col items-center rounded-[10px] border border-grey bg-white p-4 shadow-sm">
          <p class="mb-4 text-label-caps font-bold uppercase tracking-widest text-secondary">Parse Confidence</p>
          <div class="relative flex items-center justify-center">
            <svg class="h-24 w-24 -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
              <circle
                cx="48" cy="48" r="40"
                fill="transparent" stroke="currentColor"
                class="text-secondary/30"
                stroke-width="8"
              />
              <circle
                cx="48" cy="48" r="40"
                fill="transparent" stroke="currentColor"
                class="text-success transition-all duration-700"
                stroke-width="8"
                :stroke-dasharray="RING_CIRCUMFERENCE"
                :stroke-dashoffset="ringOffset"
              />
            </svg>
            <span class="absolute text-data-mono font-medium tabular-nums text-navy">
              {{ confidence.toFixed(1) }}<span class="text-body-sm">%</span>
            </span>
          </div>
          <div class="mt-4 rounded-full bg-success/10 px-3 py-1">
            <p class="text-label-caps font-bold text-success">High Reliability</p>
          </div>
        </div>

        <!-- Financial Totals -->
        <div class="grid grid-cols-1 gap-4">
          <div class="flex items-center justify-between rounded-[10px] border border-grey bg-white p-4 shadow-sm">
            <div>
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Total Deposits</p>
              <p class="text-display-lg font-semibold tabular-nums text-success">
                +{{ formatToMoney(uploadResult?.total_deposit ?? 0) }}
              </p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-[6px] bg-success/5">
              <span class="material-symbols-outlined text-success" aria-hidden="true">arrow_downward</span>
            </div>
          </div>
          <div class="flex items-center justify-between rounded-[10px] border border-grey bg-white p-4 shadow-sm">
            <div>
              <p class="text-label-caps font-bold uppercase tracking-widest text-secondary">Total Withdrawals</p>
              <p class="text-display-lg font-semibold tabular-nums text-primary">
                –{{ formatToMoney(uploadResult?.total_withdrawal ?? 0) }}
              </p>
            </div>
            <div class="flex h-12 w-12 items-center justify-center rounded-[6px] bg-primary/5">
              <span class="material-symbols-outlined text-primary" aria-hidden="true">arrow_upward</span>
            </div>
          </div>
        </div>

        <!-- Statement Metadata -->
        <div class="rounded-[10px] border border-grey bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-grey/30 px-4 py-3">
            <span class="text-label-caps font-bold uppercase tracking-widest text-secondary">Statement Metadata</span>
            <span class="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">receipt_long</span>
          </div>
          <div class="divide-y divide-grey/20">
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-body-sm text-secondary">Statement ID</span>
              <span class="text-data-mono font-medium tabular-nums text-navy">#{{ uploadResult?.id }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-body-sm text-secondary">Currency</span>
              <span class="text-data-mono font-medium tabular-nums text-navy">{{ uploadResult?.currency ?? '—' }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-body-sm text-secondary">Source Format</span>
              <span class="rounded-full bg-navy/5 px-2 py-0.5 text-label-caps font-bold uppercase tracking-widest text-navy">
                {{ uploadResult?.source_type ?? '—' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-4 px-4 py-3">
              <span class="text-body-sm text-secondary shrink-0">File</span>
              <span class="truncate text-right text-body-sm font-medium text-navy">
                {{ uploadResult?.original_file_name ?? '—' }}
              </span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-body-sm text-secondary">File Size</span>
              <span class="text-data-mono font-medium tabular-nums text-navy">{{ fileSize }}</span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-body-sm text-secondary">Opening Balance</span>
              <span class="text-data-mono font-medium tabular-nums text-navy">
                {{ formatToMoney(uploadResult?.opening_balance ?? 0) }}
              </span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-body-sm text-secondary">Closing Balance</span>
              <span class="text-data-mono font-medium tabular-nums text-navy">
                {{ formatToMoney(uploadResult?.closing_balance ?? 0) }}
              </span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-body-sm text-secondary">Processed</span>
              <span class="text-data-mono font-medium tabular-nums text-navy">
                {{ formatDate(uploadResult?.created_at, 'short') }}
              </span>
            </div>
            <div v-if="uploadResult?.exported_bank_statement_file_url" class="px-4 py-3">
              <a
                :href="uploadResult.exported_bank_statement_file_url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between text-primary transition-opacity hover:opacity-70"
              >
                <span class="text-body-sm font-medium">Download Export (Excel)</span>
                <span class="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Data quality disclosure -->
        <div
          v-if="uploadResult?.data_quality?.has_disclosure"
          class="flex items-start gap-3 rounded-[10px] border border-warning/30 bg-warning/10 p-3"
        >
          <span class="material-symbols-outlined shrink-0 text-[20px] text-warning" aria-hidden="true">info</span>
          <div>
            <p class="text-title-sm font-medium text-navy">Data Quality Disclosure</p>
            <p class="mt-1 text-body-sm text-secondary">{{ uploadResult.data_quality.message }}</p>
          </div>
        </div>

        <!-- CTAs -->
        <div class="flex flex-col gap-3 pt-2">
          <BaseButton type="button" @click="navigateTo('/dashboard')">
            <span class="flex items-center justify-center gap-2">
              View Dashboard
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">dashboard</span>
            </span>
          </BaseButton>
          <BaseButton variant="outline" type="button" @click="resetAndUploadAnother">
            <span class="flex items-center justify-center gap-2">
              Upload Another
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">cloud_upload</span>
            </span>
          </BaseButton>
        </div>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════════════
         FAILED STATE — Processing failed
    ════════════════════════════════════════════════════════════════════════════ -->
    <template v-else-if="uploadStatus === 'failed'">
      <div class="px-4 py-6 space-y-6">
        <!-- Error Hero -->
        <div class="flex flex-col items-center rounded-[10px] bg-error/5 py-10 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <span class="material-symbols-outlined text-[40px] text-error" aria-hidden="true">error</span>
          </div>
          <h1 class="text-display-lg font-semibold text-navy">Processing Failed</h1>
          <p class="mt-2 max-w-xs text-body-md text-secondary">{{ failureMessage }}</p>
        </div>

        <!-- Parse Warnings -->
        <div
          v-if="parseWarnings.length > 0"
          class="rounded-[10px] border border-warning/30 bg-white p-4"
        >
          <div class="mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-warning" aria-hidden="true">warning</span>
            <span class="text-label-caps font-bold uppercase tracking-widest text-warning">Parse Warnings</span>
          </div>
          <ul class="space-y-3">
            <li v-for="(warn, i) in parseWarnings" :key="i" class="flex items-start gap-3">
              <span class="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-secondary" aria-hidden="true">info</span>
              <span class="text-body-sm text-navy">{{ warn }}</span>
            </li>
          </ul>
        </div>

        <!-- CTAs -->
        <div class="flex flex-col gap-3">
          <BaseButton type="button" @click="retryUpload">
            <span class="flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">cloud_upload</span>
              Retry Upload
            </span>
          </BaseButton>
          <BaseButton variant="outline" type="button" @click="navigateTo('/statements')">
            <span class="flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">list</span>
              Return to List
            </span>
          </BaseButton>
        </div>

        <!-- Secure badge -->
        <div class="flex items-center justify-center gap-2 pt-2">
          <span class="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">gpp_maybe</span>
          <span class="text-label-caps font-bold uppercase tracking-widest text-secondary">
            Secure &amp; Private Data Processing
          </span>
        </div>

        <!-- AI help strip -->
        <div class="flex items-center justify-between rounded-[10px] bg-navy p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
              <span class="material-symbols-outlined text-[20px] text-white" aria-hidden="true">psychology</span>
            </div>
            <div>
              <p class="text-title-sm font-medium text-white">Need help with formats?</p>
              <p class="text-body-sm text-secondary/80">Ask MiFlujo AI about supported banks</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-white" aria-hidden="true">chevron_right</span>
        </div>
      </div>
    </template>

  </MobileContainer>
</template>
