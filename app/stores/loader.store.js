import {defineStore} from "pinia";
import {ref} from "vue";

export const useLoaderStore = defineStore("loaderStore", () => {
    const loading = ref(false);
    const showLoader = ref(true);

    function start() {

        if (showLoader.value) {
            loading.value = true;
        }
    }

    function done() {
        loading.value = false;
        showLoader.value = true;
    }

    function dontShowLoader() {
        showLoader.value = false;
    }

    return {loading, start, done, dontShowLoader};
});
