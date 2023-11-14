const moment = require("moment-timezone");
const { DateTime } = require("luxon");
const { StatusCodes } = require("http-status-codes");
const { UTC_ZONE_DB } = require("../config/utc_zone.json");
// UTC_ZONE_DB = "America/Bogota"              // UTC of Colombia

/**
 * Get the current date and time in timestamp format with the offset corresponding to the time zone.
 * @returns The date and time in timestamp format
 */
const dateHourWithOffset = () => {
  const date = DateTime.now().setZone(UTC_ZONE_DB);
  return date;
};

/** 
 * Get the current date (yyyy-mm-dd) in timestamp format with the offset corresponding to the time zone.
 * @returns The current date
 */
const onlyDateWithOffset = () => {
  const date = dateHourWithOffset().toFormat("yyyy-MM-dd");
  return date;
};

/** 
 * Format timestamps (createdAt, updatedAt, deletedAt) with the UTC_ZONE_DB time zone.
 * @returns attributes - table fields
 */
function configureTimezoneTimestamps() {
  const attributes = { ...this.get() };
  const timestampAttributes = [
    "createdAt",
    "updatedAt",
    // "deletedAt"
  ];
  for (const attribute of timestampAttributes) {
    try {
      if (attributes[attribute]) {
        attributes[attribute] = moment(attributes[attribute]).tz(UTC_ZONE_DB).format();
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
