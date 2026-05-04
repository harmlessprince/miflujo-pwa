
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('click-outside', {
        mounted(el, binding) {
            el.clickOutsideEvent = (event: MouseEvent) => {
                // Check if the clicked element is neither the element itself nor one of its children
                if (!(el === event.target || el.contains(event.target as Node))) {
                    // If it's outside, call the provided method
                    binding.value(event);
                }
            };
            document.addEventListener('click', el.clickOutsideEvent);
        },
        unmounted(el) {
            document.removeEventListener('click', el.clickOutsideEvent);
        },
    });
});
