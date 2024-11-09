import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography } from "@mui/material";
import "../style/global.css";
import "../style/LoginRegister.css";

import { AuthContext } from "../App";

const LoginRegister = ({initialMode = "Login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const { setToken, token } = useContext(AuthContext);

  const navigate = useNavigate();


  const loginregister = async (e) => {
    e.preventDefault();
    if (mode === "Login") {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/user/login",
          {
            email,
            password,
          },
          { withCredentials: true }
        );

        if (response.status === 200) {
          setMessage(response.data.message);
          console.log(response.data);

          setToken(response.data.accessToken);
          console.log("Token received:", response.data.accessToken);
          
          localStorage.setItem("authToken", response.data.accessToken)
          navigate("/profile");
        }
      } catch (error) {
        console.log(error);

        setToken(null);

        setMessage(error.response.data.message);
      }
    } else if (mode === "Register") {
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/user/register",
          {
            name, surname, username, email, password
          },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setMessage(response.data.message);
          console.log(response.data);
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
        setMessage(error.response.data.message);
      }
    }
  };

  return (
    <div className="login-register-container">
      <div className="form-container">
        <div className="form-wrapper">
          <Typography variant="h4" className="form-title">
            {mode === "Login" ? "Login" : "Register"}
          </Typography>
          <Box component="form" noValidate autoComplete="off" sx={{ width: '100%' }}>
            {mode === "Register" && (
              <>
                <TextField className="form-input" label="Name" variant="outlined" onChange={(e) => setName(e.target.value)} />
                <TextField className="form-input" label="Surname" variant="outlined" onChange={(e) => setSurname(e.target.value)} />
                <TextField className="form-input" label="Username" variant="outlined" onChange={(e) => setUsername(e.target.value)} />
              </>
            )}
            <TextField className="form-input" label="Email" type="email" variant="outlined" onChange={(e) => setEmail(e.target.value)} />
            <TextField className="form-input" label="Password" type="password" variant="outlined" onChange={(e) => setPassword(e.target.value)} />
            
            {/* Button with type="button" to prevent form submission */}
            <button className="btn" type="button" onClick={loginregister}>
              {mode === "Login" ? "Login" : "Register"}
            </button>

            <Typography variant="body2" align="center" className="toggle-button">
              {mode === "Login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <span onClick={() => setMode(mode === "Login" ? "Register" : "Login")}>
                {mode === "Login" ? "Register" : "Login"}
              </span>
            </Typography>
          </Box>
          {message && <Typography color="error" sx={{ mt: 2 }}>{message}</Typography>}
        </div>
      </div>

      <div className="background-image" />
    </div>
  );
};
export default LoginRegister;