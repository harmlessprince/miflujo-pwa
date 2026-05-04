<template>
  <div
    :id="`dialog-${side}`"
    class="fixed inset-0 z-[100] transition-all"
    :class="[open ? 'visible' : 'invisible']"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-navy/50 transition-all duration-500 ease-in-out"
      :class="[open ? 'opacity-100' : 'opacity-0']"
      @click="$emit('update:open', false)"
    ></div>

    <!-- Drawer panel wrapper -->
    <div
      :class="[
        'fixed transition-all duration-500 ease-in-out transform',
        classNames[side],
        open ? openClassNames[side] : closeClassNames[side],
        sideWidths[side]
      ]"
      @click.stop
    >
      <div
        :class="[
          'flex flex-col h-full shadow-xl bg-white',
          contentClass,
        ]"
      >
        <slot>content</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  side: {
    type: String,
    default: "right",
    validator: (value) => ["right", "left", "top", "bottom"].includes(value),
  },
  contentClass: {
    type: String,
    default: "p-6",
  },
})

const emit = defineEmits(["update:open"])

const openClassNames = {
  right: "translate-x-0",
  left: "translate-x-0",
  top: "translate-y-0",
  bottom: "translate-y-0",
}

const closeClassNames = {
  right: "translate-x-full",
  left: "-translate-x-full",
  top: "-translate-y-full",
  bottom: "translate-y-full",
}

const classNames = {
  right: "inset-y-0 right-0",
  left: "inset-y-0 left-0",
  top: "inset-x-0 top-0",
  bottom: "inset-x-0 bottom-0",
}

const sideWidths = {
  right: "w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
  left: "w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
  top: "h-auto w-full",
  bottom: "h-auto w-full",
}
</script>
