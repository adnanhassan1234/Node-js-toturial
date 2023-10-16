const jwt = require("jsonwebtoken");
const UserRegister = require("../models/registers");

const auth = async (req, res, next) => {
  try {
    // Extract the JWT token from the request cookies
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Token missing." });
    }

    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserRegister.findOne({ _id: verifyUser._id });

    if (!user) {
      return res
        .status(401)
        .json({ error: "Authentication failed. User not found." });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error(error);
    res
      .status(401)
      .json({
        error: "Authentication failed. Invalid token or user not found.",
      });
  }
};

module.exports = auth;
