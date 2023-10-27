const { UTC_ZONE, UTC_OFFSET_MILLISECONDS } = require("../config/utc_zone.json");
// UTC_ZONE = -5              // UTC of Colombia
// UTC_OFFSET_MILLISECONDS = -5 * 60 * 60 * 1000

/**
 * Get the current date and time in timestamp format with the offset corresponding to the time zone.
 * @returns The date and time in timestamp format
 */
const dateHourWithOffset = () => {
  const currentDate = new Date();
  const currentTime = currentDate.getTime();
  currentDate.setTime(currentTime + UTC_OFFSET_MILLISECONDS);
  const date = currentDate;
  return date;
};

/** 
 * Get the current date (yyyy-mm-dd) in timestamp format with the offset corresponding to the time zone.
 * @returns The current date
 */
const onlyDateWithOffset = () => {
  const date = String(dateHourWithOffset().toISOString()).split("T")[0];
  return date;
};

module.exports = {
  UTC_OFFSET_MILLISECONDS,
  UTC_ZONE,
  dateHourWithOffset,
  onlyDateWithOffset,
};
