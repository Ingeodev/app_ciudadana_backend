/**
 * Removes the hashtag # from the HEX color code.
 * @param {String} colorHex 
 * @returns {String}
 */
const formatColorOutputForMobile = (colorHex) => {
    if (colorHex.startsWith("#"))
        return colorHex.substring(1);
    return colorHex;
};

module.exports = {
    formatColorOutputForMobile
};