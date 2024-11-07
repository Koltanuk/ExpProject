import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import { AuthContext } from "../App";

const Profile = (props) => {
    const token = localStorage.getItem("authToken");
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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

  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4">Profile Information</Typography>
      {userInfo ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1"><strong>Name:</strong> {userInfo.name}</Typography>
          <Typography variant="body1"><strong>Surname:</strong> {userInfo.surname}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {userInfo.email}</Typography>
          <Typography variant="body1"><strong>Username:</strong> {userInfo.username}</Typography>
          
        </Box>
      ) : (
        <Typography variant="body1">Loading profile...</Typography>
      )}
      <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate("/groups")}
          >
            Go to My Groups
      </Button>
    </Box>
  );
};

export default Profile;
