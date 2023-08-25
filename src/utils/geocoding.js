const { Client } = require("@googlemaps/google-maps-services-js");
const mapKey = require("../maps_service_key.json");
const { StatusCodes } = require("http-status-codes");
// https://mapsplatform.google.com/pricing/?hl=es-419
// https://developers.google.com/maps/documentation/geocoding/usage-and-billing?hl=es_419
// USD 0.005 por cada una
// (USD 5.00 cada 1,000)

/**
 * Calculate the number of matching characters between two given addresses
 * @param {string} address1 - Address.
 * @param {string} address2 - Address.
 * @return {integer} number of matching characters.
 */
function countMatchingCharacters(address1, address2) {
  try {
    const address1Words = address1.split(" ");
    const address2Words = address2.split(" ");
    let matchingCharacters = 0;

    for (const word1 of address1Words) {
      for (const word2 of address2Words) {
        if (word1 === word2) {
          matchingCharacters++;
          break;
        }
      }
    }
    return matchingCharacters;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error sending email: ${error.message}`,
      code: "Internal Server Error",
    };
  }
}

/**
 * Calculate the percentage correlation between two directions
 * @param {string} address1 - Address.
 * @param {string} address2 - Address.
 * @return {float} Percentage correlation
 */
// exports.calculateCorrelation = (address1, address2) => {
function calculateCorrelation(address1, address2) {
  const matchingCharacters = countMatchingCharacters(address1, address2);
  const totalCharacters = address1.length;
  const cor = matchingCharacters / totalCharacters;
  const res = (1 - cor)*100;
  return res;
}

/**
 * Geocoding an address
 * @param {string} address Place from which the coordinates (latitude and longitude) are to be obtained
 * @return {object} Contains latitude (lat), longitude (lon), type, and address
 */
exports.getGeocoding = async (address) => {
  try {

    const client = new Client();
    
    const resMap = await client.geocode({
      params: {
        key: mapKey.apiKey,
        address,
      },
      timeout: 1000, // milliseconds
    });

    if (resMap.data.error_message) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error geocoding : ${error.status}`,
        code: "Internal Server Error",
      };
    }

    let location = {};
    location.lat = resMap.data.results[0].geometry.location.lat;
    location.lon = resMap.data.results[0].geometry.location.lng;
    location.type = resMap.data.results[0].geometry.location_type;
    location.address = resMap.data.results[0].formatted_address;
    return location;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error sending email: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};
