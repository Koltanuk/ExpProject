const { Router } = require("express");
const { verifyToken } = require("../middlewares/verifyToken.js");

const userController = require("../controllers/userController.js");

const router = Router();
 
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.delete("/logout", userController.logoutUser);

router.get("/all", verifyToken, userController.getUsers);
router.get("/auth", verifyToken, userController.verifyAuth);
router.get("/profile", verifyToken, userController.getUserProfile);
router.get("/email/:email", verifyToken, userController.getUserByEmail);
router.get("/username/:username", verifyToken, userController.getUserByUsername)



module.exports = router;
