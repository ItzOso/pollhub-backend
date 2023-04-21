const express = require("express");
const router = express.Router();


const authController = require("../Controllers/auth.js");
const authenticateToken = require("../Middlewares/authenticateToken.js");

router.post("/signup", authController.handleSignup)
router.post("/login", authController.handleLogin)
router.get("/verifytoken", authenticateToken, authController.verifyToken)

module.exports = router