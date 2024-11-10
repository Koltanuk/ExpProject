import React, { useState } from "react";
import { Button, TextField, Select, MenuItem, Typography } from "@mui/material";
import axios from "axios";
import "../style/GroupExp.css";


const CurrencyConverter = ({ amount, fromCurrency }) => {
  const [toCurrency, setToCurrency] = useState("USD"); // Default target currency
  const [convertedAmount, setConvertedAmount] = useState(null);

  const handleCurrencyChange = (e) => {
    setToCurrency(e.target.value);
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/groups/convert-amount", {
        amount,
        fromCurrency,
        toCurrency,
      });
      setConvertedAmount(response.data.convertedAmount);
    } catch (error) {
      console.error("Error converting currency:", error);
    }
  };

  return (
    <div>
      <Typography variant="h6">Convert Expense Amount</Typography>
      <TextField label="Amount" value={amount} disabled />
      <Select value={toCurrency} onChange={handleCurrencyChange} >
        <MenuItem value="USD">USD</MenuItem>
        <MenuItem value="EUR">EUR</MenuItem>
        <MenuItem value="GBP">GBP</MenuItem>
        <MenuItem value="JPY">JPY</MenuItem>
        {/* Add more currencies as needed */}
      </Select>
      <Button variant="contained" color="primary" onClick={handleConvert}>
        Convert
      </Button>

      {convertedAmount && (
        <Typography variant="body1" style={{ marginTop: "10px" }}>
          Converted Amount: {convertedAmount} {toCurrency}
        </Typography>
      )}
    </div>
  );
};

export default CurrencyConverter;
