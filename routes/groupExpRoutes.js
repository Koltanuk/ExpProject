const { Router } = require("express");
const { verifyToken } = require("../middlewares/verifyToken.js");
const expenseController = require("../controllers/expenseController.js");

const router = Router();



router.get("/:groupId/details", verifyToken, expenseController.getGroupDetails);

router.post("/:groupId/expenses", verifyToken, expenseController.addExpense);
router.post("/adjust-balance", verifyToken, expenseController.adjustBalance);

router.delete("/:groupId/expenses/:expenseId", verifyToken, expenseController.deleteExpense);
router.post("/convert-amount", expenseController.convertExpenseAmount);

module.exports = router;