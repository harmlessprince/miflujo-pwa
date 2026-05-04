import {ref} from "vue";
import {defineStore} from "pinia";

export const useErrorStore = defineStore("errorStore", () => {
    const errorMessage = ref(null);
    const validationErrors = ref(null);
    const serverError = ref(false);
    const nextStep = ref(null);
    const errorCode = ref(null);

    function resetErrors() {
        errorMessage.value = null;
        validationErrors.value = [];
        serverError.value = false;
        nextStep.value = null;
        errorCode.value = null;
    }

    function setErrorMessage(message) {
        errorMessage.value = message;
    }

    function setValidationErrors(errors) {
        validationErrors.value = errors;
    }

    function setServerError(isServerError) {
        serverError.value = isServerError;
    }

    function setNextStep(value) {
        nextStep.value = value;
    }

    function setErrorCode(value) {
        errorCode.value = value;
    }

    function getErrorMessage() {
        return errorMessage.value;
    }

    function getValidationError() {
        return validationErrors.value;
    }

    function getServerError() {
        return serverError.value;
    }

    function getNextStep() {
        return nextStep.value;
    }

    function getErrorCode() {
        return errorCode.value;
    }

    return {
        setErrorMessage,
        setServerError,
        setValidationErrors,
        setNextStep,
        setErrorCode,
        getErrorMessage,
        getServerError,
        getValidationError,
        getNextStep,
        getErrorCode,
        resetErrors,
        nextStep,
        errorCode,
    };
});
