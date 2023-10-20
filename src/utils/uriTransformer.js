/**
 * Default keyword that is used to save file paths in the database.
 */
const filesMsHostUriReplaceKeyword = "|__this host__|";

/**
 * Default base URI of the FILE MANAGEMENT MICROSERVICE.
 */
// const filesMsHostUri = process.env.FILES_MS_HOST_BASE_URI;
const filesMsHostUri = "https://file-management-cmiesjcqoq-ue.a.run.app";

/**
 * Function that replaces the default FILE MANAGEMENT MICROSERVICE base URI into a default keyword that will later be used to replace.
 * @param {String} uri File or Image URI as received from the request.
 * @returns The `imageUri` or `fileUri` that should be saved in the DB if the image is saved in the File Management Microservice
 */
const transformReceivedUriToSave = (uri) => {
    if (typeof uri != 'string')
        return uri;
    const transformedURI = String(uri).replace(filesMsHostUri, filesMsHostUriReplaceKeyword);
    return transformedURI;
};

/**
 * Function that replaces the default keyword for the default base URI of the FILE MANAGEMENT MICROSERVICE so files can be downloaded.
 * @param {String} uri File or Image URI as received form the database.
 * @returns The `imageUri` or `fileUri` that allows downloading and should be returned to users.
 */
const transformSavedUriToSend = (uri) => {
    if (typeof uri != 'string')
        return uri;
    const transformedURI = String(uri).replace(filesMsHostUriReplaceKeyword, filesMsHostUri);
    return transformedURI;
};

module.exports = {
    filesMsHostUri,
    filesMsHostUriReplaceKeyword,
    transformReceivedUriToSave,
    transformSavedUriToSend,
};
