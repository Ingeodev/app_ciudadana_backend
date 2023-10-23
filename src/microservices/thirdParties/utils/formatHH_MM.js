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

/**
 * Converts from 24-hour format to 12-hour format
 * @param {Integer} seconds - seconds
 * @return {String} hh:mm is in 24-hour format
 */
const convertTo12h = (time24h) => {
  const partes = time24h.split(":");

  if (partes.length !== 3) {
    throw new Error("The time format is invalid");
  }

  let hours = parseInt(partes[0], 10);
  const mm = partes[1];
  const ss = partes[2];
  let period = "am";

  if (hours >= 12) {
    period = "pm";
    if (hours > 12) {
      hours -= 12;
    }
  }

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, "0")}:${mm}:${ss} ${period}`;
};



exports.hhmmToSeconds = hhmmToSeconds;
exports.secondsToHhmm = secondsToHhmm;
exports.convertTo12h = convertTo12h;
