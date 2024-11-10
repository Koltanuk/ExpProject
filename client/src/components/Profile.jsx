import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Divider } from "@mui/material";
import "../style/Profile.css";

const Profile = (props) => {
    const token = localStorage.getItem("authToken");
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({});
  const navigate = useNavigate();

  

  // Fetch user profile information
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log ("Before fetching");
        const response = await axios.get("http://127.0.0.1:5000/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
        console.log(userInfo);
      } catch (error) {
        console.log("Error fetching profile:", error);
      }
    };

    
    if (loading) {
        fetchUserProfile();
      }
  }, [token]);

  // Redirect to login if not logged in
  if (!token) {
    navigate("/login");
  }
  const handleEditProfile = () => {
    setEditMode(true);
    setUpdatedInfo(userInfo); // Populate the dialog with current user info
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put("http://127.0.0.1:5000/user/update", updatedInfo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(updatedInfo); // Update local userInfo state with the new data
      setEditMode(false); // Close the dialog
      setLoading(true); // Refetch the profile data
    } catch (error) {
      console.log("Error updating profile:", error);
    }
  };

  
  return (
    <div className="profile-container">
      <Typography variant="h4" className="profile-title">Profile Information</Typography>
      {userInfo ? (
        <Box sx={{ mt: 2, width: '100%', maxWidth: 500 }}>
          <List>
            <ListItem>
              <ListItemText
                primary={<span className="profile-label">Name</span>}
                secondary={<span className="profile-info">{userInfo.name}</span>}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={<span className="profile-label">Surname</span>}
                secondary={<span className="profile-info">{userInfo.surname}</span>}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={<span className="profile-label">Email</span>}
                secondary={<span className="profile-info">{userInfo.email}</span>}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary={<span className="profile-label">Username</span>}
                secondary={<span className="profile-info">{userInfo.username}</span>}
              />
            </ListItem>
          </List>

          <div className="profile-buttons" style={{ marginTop: '20px' }}>
            <Button variant="contained" onClick={() => navigate("/groups")} className="profile-button">
              Go to My Groups
            </Button>
            <Button variant="contained" onClick={handleEditProfile} className="profile-button">
              Edit Profile
            </Button>
          </div>
        </Box>
      ) : (
        <Typography variant="body1">Loading profile...</Typography>
      )}

      {/* Dialog for editing profile */}
      <Dialog open={editMode} onClose={() => setEditMode(false)}>
        <DialogTitle className="dialog-title">Edit Profile</DialogTitle>
        <DialogContent className="dialog-content">
          <TextField
            label="Name"
            fullWidth
            value={updatedInfo.name || ""}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, name: e.target.value })}
          />
          <TextField
            label="Surname"
            fullWidth
            value={updatedInfo.surname || ""}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, surname: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            value={updatedInfo.email || ""}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, email: e.target.value })}
          />
          <TextField
            label="Username"
            fullWidth
            value={updatedInfo.username || ""}
            onChange={(e) => setUpdatedInfo({ ...updatedInfo, username: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)} className="cancel-button">Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile} className="save-button">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;
