const { db } = require("../config/db.js");

module.exports = {
    createGroup: async (groupInfo) => {
      const { name, createdBy } = groupInfo;
      const trx = await db.transaction();
  
      try {
        const [group] = await trx("groups").insert(
          { name, created_by: createdBy },
          ["id", "name", "created_by"]
        );
  
        // Add the creator as the first member of the group
        await trx("group_members").insert({ group_id: group.id, user_id: createdBy });
  
        await trx.commit();
        return group;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    },
  
    addMemberToGroup: async (groupId, userId) => {
      console.log("Inside groupModel adding member, userId:", userId);
      try {
        await db("group_members").insert({
          group_id: groupId,
          user_id: userId,
        });
        console.log(`Added member ID ${userId} to group ID ${groupId}`);
      } catch (error) {
        console.error("Error adding member to group:", error);
        throw error;
      }
    },
  
    getGroupByNameAndCreator: async (groupName, userId) => {
      try {
        const group = await db("groups")
          .select("id", "name", "created_by")
          .where({ name: groupName, created_by: userId })
          .first();
  
        console.log("Group fetched:", group);
        return group;
      } catch (error) {
        console.error("Error fetching group by name and creator ID:", error);
        throw error;
      }
    },

    removeMemberFromGroup: async (groupId, userId) => {
      try {
        return await db("group_members").where({ group_id: groupId, user_id: userId }).del();
      } catch (error) {
        throw error;
      }
    },

    getGroupByUserId: async (userId) => {
      try {
        
        const groups = await db("groups")
          .select("id", "name", "created_by")
          .where({ created_by: userId });
  
        console.log("Groups fetched for user ID:", userId, groups); // Log the result for debugging
        return groups;
      } catch (error) {
        console.error("Error fetching groups by user ID:", error);
        throw error;
      }
    },
    
    getGroupById: async (groupId) => {
      try {
        const group = await db("groups").where({ id: groupId }).first();
        const members = await db("group_members")
          .join("authusers", "group_members.user_id", "authusers.id")
          .select("authusers.id", "authusers.name", "authusers.username", "authusers.email")
          .where("group_members.group_id", groupId);
  
        return { ...group, members };
      } catch (error) {
        throw error;
      }
    },

    deleteGroupById: async (id) => {
      try {
        await db("groups")
          .where({ id })
          .del();
      } catch (error) {
        console.error("Error deleting group by ID:", error);
        throw error;
      }
    },
  };