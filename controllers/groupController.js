const groupModel = require("../models/groupModel");
const userModel = require("../models/userModel"); 

module.exports = {
    createGroup: async (req, res) => {
        const { name } = req.body;
        const createdBy = req.user.id; // Assuming `req.user` contains the authenticated user's details
        
        try {
          const group = await groupModel.createGroup({ name, createdBy });
          res.status(201).json(group);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

    addMember: async (req, res) => {
        const { groupName, email } = req.body;
        const userId = req.user.id;

        console.log("Adding member with email:", email, "to group:", groupName, "by user ID:", userId);

        const group = await groupModel.getGroupByNameAndCreator(groupName, userId);
        if (!group) {
          return res.status(404).json({ message: "Group not found or unauthorized access" });
        }

        const newMember = await userModel.getUserByEmail(email);
        if (!newMember) {
        return res.status(404).json({ message: "User with specified email not found" });
        }

        const groupId = group.id;
        const newMemberId = newMember.id;

        console.log("Adding member with id:", newMemberId, "to group:", groupId);

        try {
          await groupModel.addMemberToGroup(groupId, newMemberId);
          res.status(200).json({ message: "Member added successfully" });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },

    getUserGroups: async (req, res) => {
        const userId = req.user.id
        console.log("User ID from token in groupsgetByUserId:", userId);
        try {
          const groups = await groupModel.getGroupByUserId(userId);
          console.log("Groups retrieved:", groups);
          res.status(200).json(groups);
        } catch (error) {
          res.status(500).json({ message: "Error retrieving user groups", error });
        }
      },  
    removeMember : async (req, res) => {
        const { groupId, userId } = req.body;
      
        try {
          await groupModel.removeMemberFromGroup(groupId, userId);
          res.status(200).json({ message: "Member removed successfully" });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    getGroupDetails: async (req, res) => {
        const { groupId } = req.params;
      
        try {
          const group = await groupModel.getGroupById(groupId);
          if (!group) {
            return res.status(404).json({ message: "Group not found" });
          }
          res.status(200).json(group);
        } catch (error) {
          res.status(500).json({ error: error.message });
    }},

    deleteGroup: async (req, res) => {
      try {
        const { groupId } = req.params;
        const userId = req.user.id; // Authenticated user's ID
        console.log("groupId and user Id in deleting group controller", groupId, userId);
        // Check if the group exists and if the user is the creator
        
        const membersWithBalance = await groupModel.getMembersWithNonZeroBalance(groupId);

        if (membersWithBalance.length > 0) {
          return res.status(400).json({
            message: "Cannot delete group. All member balances must be zero before deletion.",
          });
        }

        const group = await groupModel.getGroupById(groupId);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }
    
        if (group.created_by !== userId) {
          return res.status(403).json({ message: "You are not authorized to delete this group" });
        }
    
        // Proceed with deletion
        await groupModel.deleteGroupById(groupId);
        res.status(200).json({ message: "Group deleted successfully" });
      } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: "Error deleting group", error });
      }
    }
    
};  