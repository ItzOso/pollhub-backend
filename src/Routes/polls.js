const express = require("express")
const router = express.Router()
const authenticateToken = require("../Middlewares/authenticateToken");
const pollController = require("../Controllers/polls.js")

// get all polls
router.get("/polls", authenticateToken, pollController.getPolls)

// create poll
router.post("/polls", authenticateToken, pollController.createPoll)

// delete poll
router.delete("/polls/:id", authenticateToken, pollController.deletePoll)

// vote on poll
router.post("/polls/:id", authenticateToken, pollController.vote)

module.exports = router;