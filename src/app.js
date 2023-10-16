require("dotenv").config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
require("./db/conn");
const Register = require("./models/registers");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

// function generateAuthToken(user) {
//   const token = jwt.sign({_id: user._id}, "mynameisadnanhassantararkhanpur");
//   return token;
// }

// console.log(process.env.SECRET_KEY)

const app = express();
const port = process.env.PORT || 8000;

const temp_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// app.use(express.static(temp_path));
app.set("view engine", "hbs");
app.set("views", temp_path);
hbs.registerPartials(partial_path);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", auth, (req, res) => {
  console.log(`Secret cookies: ${req.cookies.jwt}`);
  res.render("secret");
});

app.get("/register", auth, (req, res) => {
  res.render("register");
});

app.get("/logout", auth, async (req, res) => {
  try {

    req.user.tokens = req.user.tokens.filter((currElm) => {
      return currElm.token !== req.token
    })

    res.clearCookie("jwt");
    console.log("Logout successfully!");
    await req.user.save();
    res.render("/");

  } catch (error) {
    res.status(500).send(error);
  }
});

// register a user
app.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      gender,
      phone,
      age,
      password,
      confirmpassword,
    } = req.body;

    if (password === confirmpassword) {
      const registerNewUser = new Register({
        firstName,
        lastName,
        email,
        gender,
        phone,
        age,
        password,
        confirmpassword,
      });

      // const  token = generateAuthToken(registerNewUser);
      const token = await registerNewUser.generateAuthToken();
      // console.log(" token1:", token)
      // Save the user to the database

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 60000),
        httpOnly: true,
      });
      const registerData = await registerNewUser.save();

      res.status(201).render("index", {
        registerData,
        message: "User registered successfully",
      });
    } else {
      res.status(400).render("register", { error: "Passwords do not match" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// login a user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Register.findOne({ email: email });

    const token = await user.generateAuthToken();
    console.log(" token1:", token);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 50000),
      httpOnly: true,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid  password" });
    } else {
      res.status(200).json({ message: "Login successful", user });
      console.log(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Your connection port is running at ${port}`);
});
