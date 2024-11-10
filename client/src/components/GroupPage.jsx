import axios from "axios";
import { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, List, ListItem, ListItemText } from "@mui/material";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import "../style/GroupPage.css";


const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); 

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

  const navigateToGroupExp = (groupId) => {
    navigate(`/groups/${groupId}`);
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
      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Failed to delete group");
      }
      console.log("Error deleting group:", error);
    }
  };

  return (
    <div className="groups-page-container">
      <Button variant="outlined" onClick={() => navigate("/profile")} className="back-button" sx={{ mb: 2 }}>
        Back to Profile
      </Button>
      <Typography variant="h4">My Groups</Typography>

      {/* Create Group Section */}
      <div className="group-form-container">
        <TextField
          className="group-input"
          label="Group Name"
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button className="btn-create" onClick={createGroup}>
          Create Group
        </button>
      </div>

      {/* Add Member Section */}
      <div className="add-member-container">
        <TextField
          className="group-input"
          label="Member Email"
          variant="outlined"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
        />
        <TextField
          className="group-input"
          label="Group Name"
          variant="outlined"
          value={selectedGroupName}
          onChange={(e) => setSelectedGroupName(e.target.value)}
        />
        <button className="btn-add-member" onClick={addMemberToGroup}>
          Add Member
        </button>
      </div>

      {message && <Typography variant="body2" className="message-text">{message}</Typography>}

      {/* Display User's Groups */}
      <List className="groups-list">
        {groups.map((group) => (
          <ListItem key={group.id} className="groups-list-item" button onClick={() => navigateToGroupExp(group.id)}>
            <ListItemText primary={group.name} secondary={`Created by user with id ${group.created_by}`} />
            <Button
              variant="outlined"
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation(); // Prevents navigation when delete button is clicked
                deleteGroup(group.id);
              }}
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default GroupPage;
