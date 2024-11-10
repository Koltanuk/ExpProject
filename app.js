const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require("path");
const userRouter = require('./routes/usesrRouter');
const groupRoutes = require("./routes/groupRoutes");
const groupExpRoutes = require("./routes/groupExpRoutes");
const {db} = require('./config/db')



const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:['http://localhost:5173'],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"]
  }));



app.listen( process.env.PORT || 5000, () => {
    console.log(`run on ${process.env.PORT || 5000}`);
    
})

app.use("/user", userRouter);
app.use("/groups", groupRoutes);
app.use("/groups", groupExpRoutes);
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  app.use(express.static(path.join(__dirname, "/client/dist")));


  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
  });
  