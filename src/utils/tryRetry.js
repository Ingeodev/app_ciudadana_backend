const AsyncTryRetry = async (functionToRetry, functionArgumentsObj, attempts = 2, allowedErrorMessages = null) => {
    // TODO: Check how to handle the functionArgumentsObj.
    if (allowedErrorMessages == null)
        allowedErrorMessages = [];
    const errors = [];
    let result;
    if (!attempts || attempts < 1 || attempts > 10) {
        attempts = 2;
        console.warn(`<attempts> must be between 1 and 10. The value of ${attempts} is invalid; it will be set to 2.`);
    }
    for (let i = 0; i < attempts; i++) {
        try {
            result = await functionToRetry(...functionArgumentsObj);
            return { result, errors };
        } catch (error) {
            errors.push(error);
            if (allowedErrorMessages != null && !allowedErrorMessages.includes(error.message)) {
                return { errors };
            }
        }
    }
};

module.exports = AsyncTryRetry;