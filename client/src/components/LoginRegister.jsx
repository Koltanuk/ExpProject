import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box } from "@mui/material";

import { AuthContext } from "../App";

const LoginRegister = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const { setToken, token } = useContext(AuthContext);

  const navigate = useNavigate();


  const loginregister = async () => {
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
          navigate("/");
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
    <>
      <h2>{mode}</h2>
      <Box component={"form"} sx={{ m: 1 }} noValidate autoComplete='off'>
      {mode === "Register" && (
          <>
            <TextField
              sx={{ m: 1 }}
              id="name"
              label="Enter your name..."
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              sx={{ m: 1 }}
              id="surname"
              label="Enter your surname..."
              variant="outlined"
              onChange={(e) => setSurname(e.target.value)}
            />
            <TextField
              sx={{ m: 1 }}
              id="username"
              label="Enter your username..."
              variant="outlined"
              onChange={(e) => setUsername(e.target.value)}
            />
          </>
        )}
        <TextField
          sx={{ m: 1 }}
          id="email"
          type="email"
          label="Enter your email..."
          variant="outlined"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          sx={{ m: 1 }}
          id="password"
          type="password"
          label="Enter your password..."
          variant="outlined"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Box>
      <Button variant="contained" onClick={loginregister}>
        {mode}
      </Button>
      <div>{message}</div>
    </>
  );
};
export default LoginRegister;
