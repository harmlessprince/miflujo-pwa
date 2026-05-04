import {defineStore} from "pinia";

export const useToastStore = defineStore("toastStore", () => {
    const toast = useToast()

    function error(message, title = "Error") {
        return toast.error({
            title: title,
            message: message,
            position: "topRight",
        });
    }

    function success(message, title = "Success") {
        return toast.success({
            title: title,
            message: message,
            position: "topRight",
        });
    }

    function warning(message, title = "Warning") {
        return toast.warning({
            title: title,
            message: message,
            position: "topRight",
        });
    }
    function info(message, title = "Info") {
        return toast.info({
            title: title,
            message: message,
            position: "topRight",
        });
     }  

    return {
        error,
        success,
        warning,
        info,
    }
});