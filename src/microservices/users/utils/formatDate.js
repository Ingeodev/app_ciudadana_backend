/**
 * Format a Date object to the format YYYYY-MM-DD HH:MM:SS.MMM
 * @param {object} date - Date type object.
 * @return {string} Date with format
 */
const formatDate = (date = new Date()) => {
  return `${[
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")} ${[
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join(":")}.000`;
};
// const fecha_envio = formatDate(new Date());
exports.formatDate = formatDate;
