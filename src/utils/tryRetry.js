const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const validate_input = (functionToRetry, functionArgumentsObj, attempts, allowedErrorMessages, sleepms) => {
    if (functionToRetry == null || typeof functionToRetry !== 'function')
        throw new Error("Type error: <functionToRetry> must be a function.");
    if (functionArgumentsObj == null)
        functionArgumentsObj = [];
    else if (!Array.isArray(functionArgumentsObj))
        throw new Error("Type error: if defined, <functionArgumentsObj> must be an array.");
    if (!attempts || typeof attempts !== 'number' || attempts < 1 || attempts > 10) {
        attempts = 2;
        console.warn(`<attempts> must be between 1 and 10. The value of ${attempts} is invalid; it will be set to 2.`);
    }
    attempts = Math.round(attempts);
    if (allowedErrorMessages == null)
        allowedErrorMessages = [];
    else if (!Array.isArray(allowedErrorMessages))
        throw new Error("Type error: if defined, <allowedErrorMessages> must be an array.");
    if (sleepms == null || typeof sleepms !== 'number' || sleepms < 0 || sleepms > 10000) {
        sleepms = 0;
        console.warn(`<sleepms> must be between 0 and 10000. The value of ${sleepms} is invalid; it will be set to 0.`);
    }
    sleepms = Math.round(sleepms);
};

/**
 * Asyncronously tries the function `functionToRetry` and and retries it `attempts` times if it fails.
 * @param {Function} functionToRetry The function that will be retried if fails.
 * @param {Array} functionArgumentsObj An Array with the arguments that are received by `functionToRetry`.
 * @param {number} attempts Maximum number of retries; the minimum allowed is 2 and the maximum is 10.
 * @param {string[]} allowedErrorMessages Optional. An Array of error messages that will trigger the retry of `functionToRetry`. If it is defined, only exact matches will trigger the retry. If it is not defined, any error will trigger the retry.
 * @param {number} sleepms Optional. Milliseconds to sleep before each retry. Minimum is 0, maximum is 10000. Default is 0.
 * @returns An object possibly including two keys: {`result`: the result from a successful try, `errors`: the thrown errors during the retries.}.
 */
const tryRetry = async (functionToRetry, functionArgumentsObj = [], attempts = 2, allowedErrorMessages = [], sleepms = 0) => {
    let retryfunc = functionToRetry;
    let args = functionArgumentsObj;
    let atmp = attempts;
    let allowedErrors = allowedErrorMessages;
    let sleep = sleepms;
    validate_input(retryfunc, args, atmp, allowedErrors, sleep);
    const errors = [];
    let result;
    for (let i = 0; i < atmp; i++) {
        try {
            result = await retryfunc(...args);
            return { result, errors };
        } catch (error) {
            errors.push(error);
            if (allowedErrors.length > 0 && !allowedErrors.includes(error.message)) {
                return { result: null, errors };
            }
        }
        if (sleep)
            await sleepNow(sleep);
    }
    return { result: null, errors };
};


module.exports = {
    tryRetry,
};