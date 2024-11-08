require("dotenv").config();
// import
const config = require("./config.json");
const mongoose = require("mongoose");
const NotesRoute = require("./routes/Notes.route");
// mongoDb connection

const userName = process.env.NAME;
const password = process.env.PASSWORD;



mongoose
  .connect(
    `mongodb+srv://${userName}:${password}@cluster0.jhqe1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log("connect ");
  })
  .catch(() => {
    console.log(" no connect");
  });
// User model
const User = require("./models/user.models");

// require
const express = require("express");
const core = require("cors");
const app = express();

app.use(express.json());

app.use("/api/Notes", NotesRoute);

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(
  core({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full Name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  const isUser = await User.findOne({ email: email });

  if (isUser) {
    return res.json({
      error: true,
      message: "User already exist",
    });
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const accessTokin = jwt.sign({ user }, process.env.ACCESS_TOKIN_SECRET, {
    expiresIn: "3600m",
  });

  return res.json({
    error: false,
    user,
    accessTokin,
    message: "Registration Successful",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const UserInfo = await User.findOne({ email: email });

  if (!UserInfo) {
    return res.status(400).json({ message: "User not found " });
  }

  if (UserInfo.email == email && UserInfo.password == password) {
    const user = { user: UserInfo };
    const accessTokin = jwt.sign(user, process.env.ACCESS_TOKIN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      email,
      accessTokin,
    });
  } else {
    return res.status(400).json({
      error: true,
      message: "invalid Credentials",
    });
  }
});

app.get("/api/user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.sendStatus(401);
  }

  return res.status(200).json({
    user: {
      _id: isUser._id,
      fullName: isUser.fullName,
      email: isUser.email,
      creatdOn: isUser.creatdOn,
    },
    message: "",
  });
});

app.listen(8000);
module.exports = app;
