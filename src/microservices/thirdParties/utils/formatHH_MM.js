/**
 * Calculates how many seconds a hh:mm is in 24-hour format.
 * @param {String} time - hh:mm is in 24-hour format
 * @return {Integer} seconds
 */
const hhmmToSeconds = (time) => {
  const [hours, minutes] = time.split(":").map(Number); // Divide el string y convierte a números
  return hours * 3600 + minutes * 60; // Calcula los segundos
}

/**
 * Converts from seconds to hh:mm in 24-hour format
 * @param {Integer} seconds - seconds
 * @return {String} hh:mm is in 24-hour format
 */
const secondsToHhmm = (seconds) =>  {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

exports.hhmmToSeconds = hhmmToSeconds;
exports.secondsToHhmm = secondsToHhmm;
