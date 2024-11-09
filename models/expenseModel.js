const { db } = require("../config/db.js");

module.exports = {
  getGroupByIdWithDetails: async (groupId) => {
    try {
        const group = await db("groups")
        .select("id", "name", "created_by")
        .where({ id: groupId })
        .first();

      const members = await db("group_members")
        .join("authusers", "group_members.user_id", "=", "authusers.id")
        .select("authusers.id", "authusers.name", "group_members.balance")
        .where("group_members.group_id", groupId);

      const expenses = await db("expenses")
        .leftJoin("authusers", "expenses.paid_by", "authusers.id") // Join to get payer's name
        .where({ group_id: groupId })
        .orderBy("date", "desc")
        .select("expenses.*", "authusers.name as paid_by_name");

      // Fetch each expense's division details
      const expensesWithDivision = await Promise.all(expenses.map(async (expense) => {
        const division = await db("expense_members")
          .join("authusers", "expense_members.user_id", "=", "authusers.id")
          .select("authusers.name", "expense_members.amount")
          .where("expense_members.expense_id", expense.id);

        // Calculate percentage for each member in the division
        expense.division = division.map((member) => ({
          name: member.name,
          percentage: ((member.amount / expense.amount) * 100).toFixed(2),
        }));

        return expense;
      }));

      return { ...group, members, expenses: expensesWithDivision };
    } catch (error) {
      throw error;
    }
  },  

  // Get all expenses for a specific group
  getExpensesByGroup: async (groupId) => {
    try {
      const expenses = await db("expenses")
        .where({ group_id: groupId })
        .orderBy("date", "desc")
        .select("id", "amount", "note", "date", "paid_by");

      // Optionally, you could join with `authusers` to get payer details if needed
      return expenses;
    } catch (error) {
      console.error("Error fetching expenses by group:", error);
      throw error;
    }
  },

  // Add a new expense
  addExpense: async (groupId, amount, note, paidBy, division) => {
    
    const trx = await db.transaction();

    try {
        const [expense] = await trx("expenses")
        .insert({ group_id: groupId, amount, note, paid_by: paidBy })
        .returning("*");

        await trx("group_members")
            .where({ group_id: groupId, user_id: paidBy })
            .increment("balance", amount);

        // Step 3: Distribute the expense among members
        for (const [userId, share] of Object.entries(division)) {
            const individualAmount = (amount * share) / 100;

            // Insert into expense_members and adjust balance in the same transaction
        await trx("expense_members").insert({
            expense_id: expense.id,
            user_id: userId,
            amount: individualAmount,
            });

        await trx("group_members")
            .where({ group_id: groupId, user_id: userId })
            .decrement("balance", individualAmount);
        }

        await trx.commit(); // Commit all changes if successful
        return expense;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  },

  getExpenseById: async (expenseId) => {
    try {
      const expense = await db("expenses").where({ id: expenseId }).first();
      if (!expense) return null;

      const division = await db("expense_members")
        .join("authusers", "expense_members.user_id", "=", "authusers.id")
        .select("expense_members.user_id", "expense_members.amount")
        .where("expense_members.expense_id", expenseId);

      return { ...expense, division };
    } catch (error) {
      console.error("Error fetching expense by ID:", error);
      throw error;
    }
  },

  deleteExpense: async (groupId, expenseId, expense) => {
    const trx = await db.transaction();

    try {
      // Reverse the balance adjustments
      for (const { user_id, amount } of expense.division) {
        await trx("group_members")
          .where({ group_id: groupId, user_id })
          .increment("balance", amount);
      }

      // Remove the total amount from the payer's balance
      await trx("group_members")
        .where({ group_id: groupId, user_id: expense.paid_by })
        .decrement("balance", expense.amount);

      // Delete entries from expense_members and expenses
      await trx("expense_members").where({ expense_id: expenseId }).del();
      await trx("expenses").where({ id: expenseId }).del();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.error("Error deleting expense:", error);
      throw error;
    }
  },

  adjustBalance: async (groupId, payerId, payeeId, amount) => {
    const trx = await db.transaction();

    try {

    const numericAmount = Number(amount);
      // Deduct amount from the payer's balance
      await trx("group_members")
        .where({ group_id: groupId, user_id: payeeId })
        .decrement("balance", numericAmount);

      // Add the same amount to the payee's balance
      await trx("group_members")
        .where({ group_id: groupId, user_id: payerId })
        .increment("balance", numericAmount);

      await trx.commit(); // Commit transaction
    } catch (error) {
      await trx.rollback(); // Rollback transaction in case of error
      console.error("Error adjusting balance:", error);
      throw error;
    }
  },
};