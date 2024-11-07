import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../App";
import axios from "axios";

const Dashboard = (props) => {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const { token } = useContext(AuthContext);

  useEffect(() => {
    all();
  }, []);

  const all = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/user/all", {
        withCredentials: true,
        headers: {
          "x-access-token": token,
        },
      });
      if (response.status === 200) {
        setUsers(response.data);
        setMsg("");
      }
    } catch (error) {
      console.log(error);
      setMsg(error.response.data.message);
    }
  };

  return (
    <>
      <h2>Dashboard</h2>
      {/* <h3>Token: {token}</h3> */}
      {users.map((item) => {
        return <div key={item.id}>{item.email}</div>;
      })}
      <h3>{msg}</h3>
    </>
  );
};
export default Dashboard;
