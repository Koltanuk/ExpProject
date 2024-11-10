import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { Box, Typography, List, ListItem, TextField, Button, Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { AuthContext } from "../App";
import axios from "axios";
import "../style/GroupExp.css";
import CurrencyConverter from "./CurrencyConverter"

const GroupExp = () => {
  const { groupId } = useParams(); // Get groupId from the URL
  const [groupDetails, setGroupDetails] = useState(null);
  const [newExpense, setNewExpense] = useState({ amount: 0, note: "", division: {} });
  const [message, setMessage] = useState("");
  const [payerId, setPayerId] = useState(""); 
  const token = localStorage.getItem("authToken");
  const [customDivision, setCustomDivision] = useState(false);
  const [evenlyDivided, setEvenlyDivided] = useState(false);
  const [adjustBalanceOpen, setAdjustBalanceOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [selectedPayeeId, setSelectedPayeeId] = useState("");
  const [selectedPayerId, setSelectedPayerId] = useState("");
  const [conversionAmount, setConversionAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/groups/${groupId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupDetails(response.data);
    } catch (error) {
      setMessage("Failed to load group details");
      console.log("Error fetching group details:", error);
    }
  };

  const handleDivisionChange = (userId, value) => {
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      division: {
        ...prevExpense.division,
        [userId]: value,
      },
    }));
    setEvenlyDivided(false);
  };

  const divideEvenly = () => {
    const numMembers = groupDetails.members.length;
    const evenDivision = 100 / numMembers;
    const division = groupDetails.members.reduce((acc, member) => {
      acc[member.id] = evenDivision;
      return acc;
    }, {});
    setNewExpense((prevExpense) => ({ ...prevExpense, division }));
    setCustomDivision(false);
    setEvenlyDivided(true);
  };

  const toggleCustomDivision = () => {
    setCustomDivision(true);
    setEvenlyDivided(false); 
  };

  const addExpense = async () => {
    const totalPercentage = Object.values(newExpense.division).reduce((acc, value) => acc + Number(value), 0);

    if (totalPercentage !== 100) {
      setMessage("Total percentage must equal 100%");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:5000/groups/${groupId}/expenses`,
        { ...newExpense, paidBy: payerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewExpense({ amount: 0, note: "", division: {} });
      setPayerId("");
      fetchGroupDetails(); // Refresh group details after adding expense
      setMessage("Expense added successfully");
      etEvenlyDivided(false);
    } catch (error) {
      setMessage("Failed to add expense");
      console.log("Error adding expense:", error);
    }
  };

  const openAdjustBalanceDialog = () => {
    setSelectedPayerId("");
    setSelectedPayeeId("");
    setAdjustAmount(0);
    setAdjustBalanceOpen(true);
  };

  const handleAdjustBalance = async () => {

    console.log("selectedPayerId:", selectedPayerId);
    console.log("selectedPayeeId:", selectedPayeeId);
    console.log("adjustAmount:", adjustAmount);

    if (!selectedPayerId || !selectedPayeeId || adjustAmount <= 0) {
      setMessage("Please select valid payer, payee, and amount.");
      return;
    }


    try {
      await axios.post(
        `http://127.0.0.1:5000/groups/adjust-balance`,
        { groupId, payerId: selectedPayerId, payeeId: selectedPayeeId, amount: adjustAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdjustBalanceOpen(false);
      setMessage("Balance adjusted successfully");
      fetchGroupDetails();
    } catch (error) {
      console.log("Error adjusting balance:", error);
      setMessage("Failed to adjust balance");
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/groups/${groupId}/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Expense deleted successfully");
      fetchGroupDetails(); // Refresh group details after deleting an expense
    } catch (error) {
      setMessage("Failed to delete expense");
      console.log("Error deleting expense:", error);
    }
  };

  return (
    <div className="group-expense-container">
      <div className="button-group">
        <Button variant="outlined" onClick={() => navigate("/groups")} className="back-button">
          Back to Groups
        </Button>
        <Button variant="outlined" onClick={() => navigate("/profile")} className="back-button">
          Back to Profile
        </Button>
      </div>

      {groupDetails ? (
        <>
          {/* Group Name Section */}
          <div className="section-container">
            <Typography variant="h4" className="section-title">Group name: {groupDetails.name}</Typography>
          </div>


          {/* Members Section */}
          <div className="section-container member-list">
            <Typography variant="h6" className="section-title">Members</Typography>
            <List>
              {groupDetails.members.map((member) => (
                <ListItem key={member.id} className="member-item">
                  <Typography>{member.name}</Typography>
                  <Typography>Balance: {Number(member.balance || 0).toFixed(2)}</Typography>
                </ListItem>
              ))}
            </List>
          </div>

          <Button variant="contained" color="primary" onClick={openAdjustBalanceDialog} className="adjust-balance-button">
            Adjust Balance
          </Button>

          <Dialog open={adjustBalanceOpen} onClose={() => setAdjustBalanceOpen(false)}>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payer</InputLabel>
                <Select value={selectedPayerId} onChange={(e) => setSelectedPayerId(e.target.value)} label="Payer">
                  {groupDetails.members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payee</InputLabel>
                <Select value={selectedPayeeId} onChange={(e) => setSelectedPayeeId(e.target.value)} label="Payee">
                  {groupDetails.members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Amount" type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} fullWidth sx={{ mb: 2 }} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAdjustBalanceOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAdjustBalance}>Confirm</Button>
            </DialogActions>
          </Dialog>

          {/* Expenses Section */}
          <div className="section-container expense-list">
            <Typography variant="h6" className="section-title">Expenses</Typography>
            <List>
              {groupDetails.expenses.map((expense) => (
                <ListItem key={expense.id} className="expense-item">
                  <Typography className="expense-details">
                    {new Date(expense.date).toLocaleString()} - {expense.note} - {Number(expense.amount || 0).toFixed(2)} paid by {expense.paid_by_name}, divided:
                    {expense.division && expense.division.map(({ name, percentage }) => (
                      <span key={name}> {name} - {percentage}%</span>
                    ))}
                  </Typography>
                  <Button variant="outlined" className="delete-button" onClick={() => deleteExpense(expense.id)}>Delete</Button>
                </ListItem>
              ))}
            </List>
          </div>

          {/* Add Expense Section */}
          <div className="section-container">
            <Typography variant="h6" className="section-title">Add Expense</Typography>
            <TextField label="Amount" type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} fullWidth sx={{ mb: 2 }} />
            <TextField label="Note" type="text" value={newExpense.note} onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })} fullWidth sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payer</InputLabel>
              <Select value={payerId} label="Payer" onChange={(e) => setPayerId(e.target.value)}>
                {groupDetails.members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="add-expense-buttons">
              <Button variant="contained" onClick={divideEvenly}>Divide Evenly</Button>
              <Button variant="contained" onClick={toggleCustomDivision}>Custom Divide</Button>
            </div>

            {customDivision && (
              <List sx={{ mt: 2 }}>
                {groupDetails.members.map((member) => (
                  <ListItem key={member.id}>
                    <Typography sx={{ mr: 2 }}>{member.name}</Typography>
                    <TextField label="Percentage" type="number" placeholder="Enter %" value={newExpense.division[member.id] || ""} onChange={(e) => handleDivisionChange(member.id, e.target.value)} sx={{ width: '100px' }} />
                    <Typography>%</Typography>
                  </ListItem>
                ))}
              </List>
            )}

            <Button variant="contained" onClick={addExpense} sx={{ mt: 2 }}>Add Expense</Button>
          </div>
          
          {message && <Typography className="message-text">{message}</Typography>}
        </>
      ) : (
        <Typography>Loading group details...</Typography>
      )}

<Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <Typography variant="h6" className="section-title">Currency Converter</Typography>
        <TextField
          label="Amount"
          type="number"
          value={conversionAmount}
          onChange={(e) => setConversionAmount(e.target.value)}
          sx={{ mb: 2, width: '100%' }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Currency</InputLabel>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
            <MenuItem value="GBP">GBP</MenuItem>
            <MenuItem value="JPY">JPY</MenuItem>
            {/* Add more currencies as needed */}
          </Select>
        </FormControl>
        <CurrencyConverter amount={conversionAmount} fromCurrency={currency} />
      </Box>
    </div>
  );
};

export default GroupExp;
