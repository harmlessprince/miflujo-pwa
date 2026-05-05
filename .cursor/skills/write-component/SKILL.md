---
name: write-component
description: Create a Vue/Nuxt component in ShopSynch
context: fork
---

# /write-component

You are creating a reusable Vue component using Nuxt 3 and the Composition API.

## Checklist

- [ ] Create file in `components/<Domain>/<ComponentName>.vue` (or root `components/` for base UI)
- [ ] Use `<script setup>`
- [ ] Define props using `defineProps()` with explicit types and defaults
- [ ] Define emits using `defineEmits()`
- [ ] Use TailwindCSS for styling (avoid `<style>` blocks unless necessary)
- [ ] Use `vee-validate` for form components
- [ ] Implement accessibility (ARIA labels, proper semantic HTML)
- [ ] Use `material-symbols-outlined` for icons

## Code Template

```vue
<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['select', 'close']);

function handleAction(item) {
    emit('select', item);
}
</script>

<template>
    <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-slate-900">{{ title }}</h3>
            <span v-if="loading" class="material-symbols-outlined animate-spin text-primary">
                progress_activity
            </span>
        </div>
        
        <div class="space-y-4">
            <div v-for="item in items" :key="item.id" 
                 class="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                 @click="handleAction(item)">
                {{ item.name }}
            </div>
        </div>
    </div>
</template>
```

## Key Patterns

### Form Integration (vee-validate)
For input components, wrap with `<Field>` or use `useField()`:
```vue
<Field :name="name" :modelValue="modelValue" v-slot="{ field, errors }">
    <input v-bind="field" class="..." />
    <p v-if="errors.length" class="text-rose-500 text-xs">{{ errors[0] }}</p>
</Field>
```

### Modern Styling
- Use HSL colors defined in Tailwind config (e.g., `primary`, `secondary`).
- Use `rounded-xl` or `rounded-2xl` for the "modern/premium" look.
- Use `shadow-sm` or `shadow-md` for depth.

## Integration Example

Using the component in a page:

```vue
<ProductCard 
    title="Summer Collection" 
    :items="products" 
    @select="onProductSelect" 
/>
```

## See Also
- [[write-store]] — Connecting components to state
- [[write-page]] — Composing components into views
