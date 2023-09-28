const fetch = require("node-fetch");
const fetchApi = async (url, options) => {
  try {
    let response;
    options
      ? (response = await fetch(url, options))
      : (response = await fetch(url));
    return response;
  } catch (error) {
    console.log("There was an error", error);
    return error;
  }
};

module.exports = fetchApi;
