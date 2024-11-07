import axios from "axios";
import { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, List, ListItem, ListItemText } from "@mui/material";
import { AuthContext } from "../App";

const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [message, setMessage] = useState("");

  // Get token from localStorage
  const token = localStorage.getItem("authToken");
  console.log("Token from localStorage:", token);

  // Fetch groups on component mount
  useEffect(() => {
    if (token) {
      fetchGroups();
    } else {
      setMessage("Unauthorized access. Please log in.");
    }
  }, [token]);

  // Function to fetch all groups the user belongs to
  const fetchGroups = async () => {
    try {
      console.log("Sending request with token:", token); // Log token sent in request
      const response = await axios.get("http://127.0.0.1:5000/groups/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
    } catch (error) {
      setMessage("Failed to load groups");
      console.log("Error fetching groups:", error); // Log error details
    }
  };

  // Function to create a new group
  const createGroup = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/groups/create",
        { name: groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Group created successfully");
      setGroupName("");
      fetchGroups(); // Refresh group list
    } catch (error) {
      setMessage("Failed to create group");
      console.log(error);
    }
  };

  // Function to add a member to a group
  const addMemberToGroup = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/groups/add-member",
        { groupName: selectedGroupName, email: newMemberEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Member added successfully");
      setNewMemberEmail("");
      fetchGroups(); // Refresh group list
    } catch (error) {
      setMessage("Failed to add member");
      console.log(error);
    }
  };

  // Function to delete a group
  const deleteGroup = async (groupId) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5000/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Group deleted successfully");
      fetchGroups(); // Refresh group list
    } catch (error) {
      setMessage("Failed to delete group");
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4">My Groups</Typography>

      {/* Create Group Section */}
      <Box component="form" sx={{ m: 1 }} noValidate autoComplete="off">
        <TextField
          sx={{ m: 1 }}
          label="Group Name"
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Button variant="contained" onClick={createGroup}>
          Create Group
        </Button>
      </Box>

      {/* Add Member Section */}
      <Box component="form" sx={{ m: 1 }} noValidate autoComplete="off">
        <TextField
          sx={{ m: 1 }}
          label="Member Email"
          variant="outlined"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
        />
        <TextField
          sx={{ m: 1 }}
          label="Group name"
          variant="outlined"
          value={selectedGroupName}
          onChange={(e) => setSelectedGroupName(e.target.value)}
        />
        <Button variant="contained" onClick={addMemberToGroup}>
          Add Member
        </Button>
      </Box>

      {message && <Typography variant="body2">{message}</Typography>}

      {/* Display User's Groups */}
      <List>
        {groups.map((group) => (
          <ListItem key={group.id}>
            <ListItemText primary={group.name} secondary={`Created by user ${group.created_by}`} />
            <Button variant="outlined" onClick={() => deleteGroup(group.id)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default GroupPage;
