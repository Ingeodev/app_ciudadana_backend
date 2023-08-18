const fs = require('fs/promises');

/**
 * Checks whether a directory or file exists, and can attempt to create the directory.
 * @param {string} checkPath path to check or create.
 * @param {boolean} createAsDir whether to attempt to recursively create path as directory. Default is `false`.
 * @returns {Promise<boolean>} `true` if path exists or if it was successfully created. `false` if the path does not exists or there is no access.
 * @throws Error if `createAsDir` is `true` but the creation failed.
 */
const checkIfExists = async (checkPath, createAsDir = false) => {
    try {
        await fs.access(checkPath);
        return true;
    } catch (error) {
        if (createAsDir) {
            try {
                await fs.mkdir(checkPath, { recursive: true })
                return true;
            } catch (error) {
                throw error;
            }
        }
        return false;
    }
};

module.exports = {
    checkIfExists,
};