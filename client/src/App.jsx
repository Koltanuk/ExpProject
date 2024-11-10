import "./style/global.css";
import GroupPage from "./components/GroupPage";
import LoginRegister from "./components/LoginRegister";
import Profile from "./components/Profile";
import GroupExp from "./components/GroupExp"; 
import { Route, Routes } from "react-router-dom";
import { createContext, useState } from "react";


import Auth from "./auth/Auth";

export const AuthContext = createContext();

function App() {
  const [token, setToken] = useState(null);
  return (
    <AuthContext.Provider value={{ token, setToken }}>
      
      <Routes>
        <Route path='/' element={<LoginRegister mode='Login' />} />
        
        <Route path='/login' element={<LoginRegister mode='Login' />} />
        <Route path='/register' element={<LoginRegister mode='Register' />} />
        <Route path='/groups' element={<Auth><GroupPage/></Auth> } />
        <Route path="/groups/:groupId" element={<GroupExp/>}/>
        <Route path="/profile" element={<Auth><Profile /></Auth>} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
