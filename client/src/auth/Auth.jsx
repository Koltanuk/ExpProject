import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import axios from "axios";
import LoginRegister from "../components/LoginRegister";
import { Navigate } from "react-router-dom";

const Auth = ({ children }) => {
  const [redirect, setRedirect] = useState(false);
  const { token, setToken } = useContext(AuthContext);

  useEffect(() => {
    verify();
  }, []);

  const verify = async () => {
    const storedToken = localStorage.getItem("authToken");
    console.log("Stored Token:", storedToken); // Log the token for debugging
    
    try {
      const response = await axios.get("http://127.0.0.1:5000/user/auth", {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (response.status === 200) {
        setToken(response.data.accessToken);
        setRedirect(true);
      }
    } catch (error) {
      console.log("Error verifying token:", error);
      setToken(null);
      setRedirect(false);
    }
  };

  return redirect ? children : <LoginRegister mode="Login" />;
};

export default Auth;
