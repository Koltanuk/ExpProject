const userModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
    registerUser : async (req,res) =>{
        const { name, surname, username, email, password } = req.body;

        console.log("Received data:", req.body);
        
        const userinfo = { name, surname, username, email, password };

        try {
            const user = await userModel.createUser(userinfo);
            res.status(201).json({message: "user registered successfully", user});
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "internal server error"});
            
        }
    },
    loginUser: async (req, res) => {
        const { email, password } = req.body;
    
        try {
          const user = await userModel.getUserByEmail(email);
    
          if (!user) {
            return res.status(404).json({ message: "user not found....." });
          }
    
          const passwordMatch = await bcrypt.compare(password + "", user.password);
    
          if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed" });
          }
          /** generate token */
          const accessToken = jwt.sign(
            { userid: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );
    
          /** set token in httpOnly cookie */
          res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: 60 * 1000,
          });
    
          res.json({
            message: "Login successfuly",
            user: { userid: user.id, email: user.email },
            accessToken,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "internal server error" });
        }
      },
    getUserById: async (req, res) => {
        const { id } = req.params;
      
        try {
          const user = await userModel.getUserById(id);
          if (!user) return res.status(404).json({ message: 'User not found' });
          res.status(200).json(user);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    getUserByEmail: async (req, res) => {
        const { email } = req.params;
      
        try {
          const user = await userModel.getUserByEmail(email);
          if (!user) return res.status(404).json({ message: 'User not found' });
          res.status(200).json(user);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    getUserByUsername: async (req, res) => {
        const { username } = req.params;
      
        try {
          const user = await userModel.getUserByUsername(username);
          if (!user) return res.status(404).json({ message: 'User not found' });
          res.status(200).json(user);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },      
    getUsers:  async (req,res) =>{

        try {
            const users = await userModel.getUsers();
            res.json(users);
            
        } catch (error) {
            console.log(error);
            res.status(500).json({message: "internal server error"});
        }
    },
    verifyAuth: (req, res) => {
        /** generate token */
        const accessToken = jwt.sign(
          { userid: req.userid, email: req.email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );
    
        /** set token in httpOnly cookie */
        res.cookie("token", accessToken, {
          httpOnly: true,
          maxAge: 60 * 1000,
        });
    
        res.json({
          message: "Auth successfuly",
          user: { userid: req.userid, email: req.email },
          accessToken,
        });
      },
      logoutUser: (req, res) => {
        res.clearCookie("token");
        res.sendStatus(200);
      },
    getUserProfile: async (req, res) => {
      try {
        const userId = req.user.id;
        console.log("User ID from token:", userId);
        
        const user = await userModel.getUserById(userId);
        
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
        
      } catch (error) {
        res.status(500).json({ message: "Error retrieving profile information", error });
      }
  },    
};

