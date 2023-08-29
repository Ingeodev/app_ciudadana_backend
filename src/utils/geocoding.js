const { Client } = require("@googlemaps/google-maps-services-js");
const mapKey = require("../maps_service_key.json");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");

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
      detail: `Error matching characters: ${error.message}`,
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
 * Geocoding an address using GoogleMaps API
 * @param {string} address Place from which the coordinates (latitude and longitude) are to be obtained
 * @return {object} Contains objects with latitude (lat), longitude (lon), type, and address
 */
exports.getGeocodingGoogle = async (address) => {
  // https://mapsplatform.google.com/pricing/?hl=es-419
  // https://developers.google.com/maps/documentation/geocoding/usage-and-billing?hl=es_419
  // USD 0.005 por cada una
  // (USD 5.00 cada 1,000)
  // https://googlemaps.github.io/google-maps-services-js/
  // https://googlemaps.github.io/google-maps-services-js/classes/Client.html
  // 
  try {
    const client = new Client();

    const resMap = await client.geocode({
      params: {
        key: mapKey.apiKeyGoogle,
        address,
        // https://developers.google.com/maps/faq?hl=es-419#languagesupport
        language: "es-419",
        // https://developers.google.com/maps/documentation/geocoding/requests-geocoding?hl=es-419#RegionCodes
        region: "CO",
        // https://googlemaps.github.io/google-maps-services-js/interfaces/GeocodeComponents.html
        components: {
          administrative_area: "Valle del Cauca",
          country: "CO",
        },
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

    const location = resMap.data.results.map((place) => ({
      lat: place.geometry.location.lat,
      lon: place.geometry.location.lng,
      type: place.geometry.location_type,
      address: place.formatted_address,
    }));

    return location;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error geocoding: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

/**
 * Geocoding an address using Here
 * @param {string} address Place from which the coordinates (latitude and longitude) are to be obtained
 * @return {array} Contains objects with lat, lng, type, address, ie, latitude, longitude, type, and address, respectively
 */
exports.getGeocodingHere = async (address) => {
  // https://developer.here.com/documentation/geocoding-search-api/api-reference-swagger.html
  // https://developer.here.com/documentation/geocoding-search-api/dev_guide/topics-api/code-geocode-qualified.html
  try {
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
      address
    )}&qq=country=Colombia;city=${encodeURIComponent(
      "Valle del Cauca"
    )}&apiKey=${mapKey.apiKeyHere}`;
    // countryCode=COL&
    
    const resMap = await axios.get(url);

    if (resMap.data.error_description) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error geocoding : ${resMap.data.error_description}`,
        code: "Internal Server Error",
      };
    }

    const location = resMap.data.items.map((place) => ({
      lat: place.position.lat,
      lon: place.position.lng,
      type: place.resultType,
      address: place.address.label,
    }));

    return location;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error geocoding: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};

/**
 * Geocoding an address using Mapbox
 * @param {string} address Place from which the coordinates (latitude and longitude) are to be obtained
 * @return {array} Contains objects with lat, lng, type, address, ie, latitude, longitude, type, and address, respectively
 */
exports.getGeocodingMapbox = async (address) => {
  // https://www.mapbox.com/pricing/
  // https://docs.mapbox.com/api/search/geocoding/
  // https://github.com/mapbox/mapbox-sdk-js
  try {
    // const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${mapKey.apiKeyMapBox}`;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?country=CO&autocomplete=false&fuzzyMatch=false&access_token=${
      mapKey.apiKeyMapBox
    }`;

    const resMap = await axios.get(url);

    if (resMap.data.error_description) {
      return {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        detail: `Error geocoding : ${resMap.data.error_description}`,
        code: "Internal Server Error",
      };
    }

    const location = resMap.data.features.map((place) => ({
      lat: place.geometry.coordinates[1],
      lon: place.geometry.coordinates[0],
      type: place.place_type[0],
      address: place.place_name,
    }));

    return location;
  } catch (error) {
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      detail: `Error geocoding: ${error.message}`,
      code: "Internal Server Error",
    };
  }
};
