const axios = require('axios');

/**
 * Makes an HTTP Call using Axios.
 *
 * @param {string} method - The HTTP method (e.g., 'get', 'post', 'put', 'delete').
 * @param {string} url - The URL to send the HTTP request to.
 * @param {object|null} data - The data to send with the request (optional, used for POST/PUT requests).
 * @param {object} headers - The HTTP headers to include in the request (optional).
 *
 * @returns {Promise<any>} A Promise that resolves with the response when the request is successful.
 * @throws {Error} If an error occurs during the request.
 */

async function makeHttpCall(method, url, data = null, headers = {}) {
  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
    });

    return response;
  } catch (error) {
    throw error;
  }
}


module.exports = {
    makeHttpCall
}