

export default defineNuxtPlugin(async (nuxtApp) => {
    nuxtApp.vueApp.directive('tooltip', {
        beforeMount(el, binding) {
            const { text, position = 'top' } = binding.value;
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = text;

            el.addEventListener('mouseover', function () {
                document.body.appendChild(tooltip);
                const rect = el.getBoundingClientRect();
                const tooltipPosition = { left: rect.left + window.scrollX, top: rect.bottom + window.scrollY + 5 };

                // Adjust position if needed
                if (position === 'bottom') {
                    tooltipPosition.top = rect.top + window.scrollY - 5;
                }

                tooltip.style.left = `${tooltipPosition.left}px`;
                tooltip.style.top = `${tooltipPosition.top}px`;
            });

            el.addEventListener('mouseout', function () {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            });
        },
    });

})
