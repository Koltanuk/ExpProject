import "./App.css";
import Dashboard from "./components/Dasbord";
import Header from "./components/Header";
import GroupPage from "./components/GroupPage";
import LoginRegister from "./components/LoginRegister";
import Profile from "./components/Profile";
import { Route, Routes } from "react-router-dom";
import { createContext, useState } from "react";

import Auth from "./auth/Auth";

export const AuthContext = createContext();

function App() {
  const [token, setToken] = useState(null);
  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <Header />
      <Routes>
        <Route path='/' element={<Profile />} />
        
        <Route path='/login' element={<LoginRegister mode='Login' />} />
        <Route path='/register' element={<LoginRegister mode='Register' />} />
        <Route path='/groups' element={<Auth><GroupPage/></Auth> } />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;

