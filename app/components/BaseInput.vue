<script setup>
import {Field} from 'vee-validate';

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: null,
    required: false,
  },
  name: {
    type: String,
    default: 'default',
  },
})
const innerValue = ref(props.modelValue);
const emit = defineEmits(["update:modelValue"]);
const updateValue = (event) => {
  emit("update:modelValue", event.target.value);
};
watch(() => props.modelValue, (val) => (innerValue.value = val));
watch(innerValue, (val) => emit("update:modelValue", val));
</script>

<template>
  <Field
      v-model="innerValue"
      :type='type'
      :placeholder='placeholder'
      class="w-full h-[47px] rounded-[10px] border border-grey outline-none px-4 font-normal text-body-md text-navy placeholder:text-grey focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      :name="name"
      :value="modelValue"
      @input="updateValue"
  />
</template>
