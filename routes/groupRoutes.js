const { Router } = require("express");
const { verifyToken } = require("../middlewares/verifyToken.js");

const groupController = require("../controllers/groupController.js");

const router = Router();


router.post("/create", verifyToken, groupController.createGroup);
router.post("/add-member", verifyToken, groupController.addMember);
router.post("/remove-member", verifyToken, groupController.removeMember);
router.get("/:groupId", verifyToken, groupController.getGroupDetails);
router.get("/", verifyToken, groupController.getUserGroups);
router.delete("/:groupId", verifyToken, groupController.deleteGroup);



module.exports = router;