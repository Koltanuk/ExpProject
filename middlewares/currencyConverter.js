const axios = require("axios");

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  console.log("Inside convertCurrency function");  
  console.log(`Params received: ${amount} from ${fromCurrency} to ${toCurrency}`);
  
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${process.env.API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`);
    console.log("Conversion response:", response.data);
    return response.data.conversion_result;
  } catch (error) {
    console.error("Error in currency conversion:", error.response?.data || error.message);
    throw new Error("Currency conversion failed");
  }
};

module.exports = convertCurrency;
