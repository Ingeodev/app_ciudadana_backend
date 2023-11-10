const moment = require("moment-timezone");
const { StatusCodes } = require("http-status-codes");
const { UTC_OFFSET_MILLISECONDS, UTC_ZONE_DB } = require("../config/utc_zone.json");
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

/** 
 * Format timestamps (createdAt, updatedAt, deletedAt) with the UTC_ZONE_DB time zone.
 * @returns attributes - table fields
 */
function configureTimezoneTimestamps() {
  const attributes = { ...this.get() };
  const timestampAttributes = ["createdAt", "updatedAt", "deletedAt"];
  for (const attribute of timestampAttributes) {
    try {
      if (attributes[attribute]) {
        attributes[attribute] = moment(attributes[attribute])
          .tz(UTC_ZONE_DB)
          .format();
      }
    } catch (error) {
      console.error(`Error formatting ${attribute}:`, error.message);
      throw {
        status: StatusCodes.UNAUTHORIZED,
        message: `Error formatting ${attribute}: ${error.message}`,
      };
    }
  }
  return attributes;
}

module.exports = {
  dateHourWithOffset,
  onlyDateWithOffset,
  configureTimezoneTimestamps,
};
