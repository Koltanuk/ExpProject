import { Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../App";
import axios from "axios";

const Header = (props) => {
  const { setToken } = useContext(AuthContext);

  const logout = async () => {
    try {
      const response = await axios.delete("http://127.0.0.1:5000/user/logout");
      console.log(response.status);
      if (response.status === 200) {
        setToken(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Stack spacing={2} direction={"row"}>
      <Button LinkComponent={Link} to='/login'>
        Login
      </Button>
      <Button LinkComponent={Link} to='/register'>
        Register
      </Button>
      <Button onClick={logout}>Logout</Button>
    </Stack>
  );
};
export default Header;
