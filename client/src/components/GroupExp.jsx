import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import { Box, Typography, List, ListItem, TextField, Button, Select, MenuItem, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { AuthContext } from "../App";
import axios from "axios";

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
    <Box sx={{ p: 2 }}>
       <Button variant="outlined" onClick={() => navigate("/groups")} sx={{ mb: 2 }}>
        Back to Groups
      </Button>
      {groupDetails ? (
        <>
          <Typography variant="h4">{groupDetails.name}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Members</Typography>
          <List>
            {groupDetails.members.map((member) => (
              <ListItem key={member.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2 }}>{member.name}</Typography>
                <Typography>Balance: ${Number(member.balance || 0).toFixed(2)}</Typography>
              </ListItem>
            ))}
          </List>

          <Button variant="contained" color="primary" onClick={openAdjustBalanceDialog} sx={{ mt: 2 }}>
            Adjust Balance
          </Button>

          <Dialog open={adjustBalanceOpen} onClose={() => setAdjustBalanceOpen(false)}>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payer</InputLabel>
                <Select
                  value={selectedPayerId}
                  onChange={(e) => setSelectedPayerId(e.target.value)}
                  label="Payer"
                >
                  {groupDetails.members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payee</InputLabel>
                <Select
                  value={selectedPayeeId}
                  onChange={(e) => setSelectedPayeeId(e.target.value)}
                  label="Payee"
                >
                  {groupDetails.members.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Amount"
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAdjustBalanceOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAdjustBalance}>Confirm</Button>
            </DialogActions>
          </Dialog>



         <Typography variant="h6" sx={{ mt: 2 }}>Expenses</Typography>
         <List>
            {groupDetails.expenses.map((expense) => (
              <ListItem key={expense.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ flex: 1 }}>
                  {new Date(expense.date).toLocaleString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })} - {expense.note} - ${Number(expense.amount || 0).toFixed(2)} paid by {expense.paid_by_name || "Unknown"}, divided :
                  {expense.division && expense.division.map(({ name, percentage }) => (
                    <span key={name}> {name} - {percentage}%</span>
                  ))}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => deleteExpense(expense.id)}
                  sx={{ ml: 2 }}
                >
                  Delete
                </Button>
              </ListItem>
            ))}
          </List>
          
           <Typography variant="h6" sx={{ mt: 2 }}>Add Expense</Typography>
           <TextField
            label="Amount"
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            sx={{ mr: 2 }}
          />
          <TextField
            label="Note"
            type="text"
            value={newExpense.note}
            onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
            sx={{ mr: 2 }}
          />

          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Payer</InputLabel>
            <Select
              value={payerId}
              label="Payer"
              onChange={(e) => setPayerId(e.target.value)}
            >
              {groupDetails.members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={divideEvenly} sx={{ mr: 2 }}>
            Divide Evenly
          </Button>
          <Button variant="contained" onClick={toggleCustomDivision} sx={{ mr: 2 }}>
            Custom Divide
          </Button>

          {evenlyDivided && (
            <List sx={{ mt: 2 }}>
              {groupDetails.members.map((member) => (
                <ListItem key={member.id}>
                  <Typography sx={{ mr: 2 }}>{member.name}</Typography>
                  <Typography>{newExpense.division[member.id]}%</Typography>
                </ListItem>
              ))}
            </List>
          )}

          {customDivision && (
            <List sx={{ mt: 2 }}>
              {groupDetails.members.map((member) => (
                <ListItem key={member.id}>
                  <Typography sx={{ mr: 2 }}>{member.name}</Typography>
                  <TextField
                    label="Percentage"
                    type="number"
                    placeholder="Enter %"
                    value={newExpense.division[member.id] || ""}
                    onChange={(e) => handleDivisionChange(member.id, e.target.value)}
                    sx={{ width: '100px' }}
                  />
                  <Typography>%</Typography>
                </ListItem>
              ))}
            </List>
          )}

          <Button variant="contained" onClick={addExpense} sx={{ mt: 2 }}>
            Add Expense
          </Button>
          {message && <Typography sx={{ color: "red", mt: 2 }}>{message}</Typography>}
        </>
      ) : (
        <Typography>Loading group details...</Typography>
      )}
    </Box>
  );
};

export default GroupExp;
