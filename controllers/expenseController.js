const expenseModel = require("../models/expenseModel");
const groupModel = require("../models/groupModel");
const convertCurrency = require("../middlewares/currencyConverter");


module.exports = {

    getGroupDetails: async (req, res) => {
        try {
          const { groupId } = req.params;
          const group = await expenseModel.getGroupByIdWithDetails(groupId);
      
          if (!group) {
            return res.status(404).json({ message: "Group not found" });
          }
      
          res.status(200).json(group);
        } catch (error) {
          console.error("Error fetching group details:", error);
          res.status(500).json({ message: "Error fetching group details" });
        }
    },



    addExpense: async (req, res) => {
        try {
          const { groupId } = req.params;
          const { amount, note, division, paidBy } = req.body;

          const groupMembers = await groupModel.getGroupMembers(groupId);
          const memberIds = groupMembers.map(member => member.user_id);
      
          // Step 2: Validate that all division user IDs are members of the group
          for (const userId of Object.keys(division)) {
            if (!memberIds.includes(parseInt(userId))) {
              return res.status(400).json({ message: `User ID ${userId} is not a valid member of the group` });
            }
          }
      
          // Step 3: Add the expense
          const expense = await expenseModel.addExpense(groupId, amount, note, paidBy, division);
      
          res.status(201).json({ message: "Expense added successfully", expense });
        } catch (error) {
          console.error("Error adding expense:", error);
          res.status(500).json({ message: "Error adding expense" });
        }
    },

    deleteExpense: async (req, res) => {
        try {
            const { groupId, expenseId } = req.params;
            const expense = await expenseModel.getExpenseById(expenseId);
        
            if (!expense) {
              return res.status(404).json({ message: "Expense not found" });
            }
        
            // Reverse the balance adjustments for each member involved in this expense
            await expenseModel.deleteExpense(groupId, expenseId, expense);
        
            res.status(200).json({ message: "Expense deleted and balances updated" });
          } catch (error) {
            console.error("Error deleting expense:", error);
            res.status(500).json({ message: "Error deleting expense", error });
          }
    },

    adjustBalance : async (req, res) => {
        const { groupId, payerId, payeeId, amount } = req.body;

        console.log("Adjusting balance with payer :", payerId, "to payeeId:", payeeId, "with amount:", amount);

        if (!groupId || !payerId || !payeeId || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid input: Please provide groupId, payerId, payeeId, and a positive amount." });
          }
      
        try {
          if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" });
          }
      
          await expenseModel.adjustBalance(groupId, payerId, payeeId, amount);
          res.status(200).json({ message: "Balance adjusted successfully" });
        } catch (error) {
          console.error("Error adjusting balance:", error);
          res.status(500).json({ message: "Error adjusting balance", error });
        }
    },

    convertExpenseAmount : async (req, res) => {
      const { amount, fromCurrency, toCurrency } = req.body;
      console.log("in controller convertcur :", amount, fromCurrency, toCurrency)
      try {
        console.log("in controller convertcur2")
        const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);
        console.log("in controller convertcur3")
        res.status(200).json({ convertedAmount, toCurrency });
      } catch (error) {
        res.status(500).json({ message: "Currency conversion failed", error: error.message });
      }
    },



}    