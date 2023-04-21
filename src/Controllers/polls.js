const mongoose = require("mongoose");
const { authenticateToken } = require("../Middlewares/authenticateToken");
const Poll = require("../Models/pollSchema");

// get all polls
const getPolls = async (req, res) => {
    try {
        const polls = await Poll.find();
        if (!polls) return res.status(404).send("No polls found!");
        res.status(200).send(polls);
    } catch (error) {
        return res.status(500).send(error);
    }
};

// create poll
const createPoll = async (req, res) => {
    try {
        const { question, options } = req.body;
        if (!question || !options) return res.status(401).send("Did not send all information needed to create a poll!");
        const optionsCheck = options.filter((option) => option !== "");
        if (optionsCheck.length < 2) return res.status(400).send("Must have at least 2 options!");

        const createdPoll = await Poll.create({
            createdBy: req.user._id,
            username: req.user.username,
            question: req.body.question,
            options: req.body.options.map((option) => {
                return {
                    text: option,
                };
            }),
        });

        return res.status(201).send(createdPoll);
    } catch (error) {
        return res.status(500).send(error);
    }
};

// delete poll
const deletePoll = async (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    try {
        // check if its a real poll
        const exists = await Poll.findOne({ _id: id });
        if (!exists) return res.status(404).send("Poll does not exist!");

        // check if the user who wants to delete it, is the user that created it
        if (exists.createdBy.toString() !== req.user._id)
            return res
                .status(401)
                .send(`You are not the owner of this poll!, ${typeof exists.createdBy}, ${typeof req.user._id}`);

        const deletedPoll = await Poll.findByIdAndDelete(id);

        return res.status(200).send(deletedPoll);
    } catch (error) {
        return res.status(500).send(error);
    }
};

// vote on poll
const vote = async (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    try {
        // check if its a real poll
        const exists = await Poll.findOne({ _id: id });
        if (!exists) return res.status(404).send("Poll has been deleted :(");

        // test to see if user has already voted
        const userVoted = await Poll.findOne({ "options.voters": { $in: [req.user._id] }, _id: id });
        if (userVoted) return res.status(403).send("User already voted!");

        const editedPoll = await Poll.updateOne(
            { _id: id },
            {
                $push: { [`options.${req.body.index}.voters`]: req.user._id },
                $inc: { [`options.${req.body.index}.votes`]: 1 },
            }
        );

        if (editedPoll.nModified === 0) {
            return res.status(409).send("An error occurred when trying to vote!");
        }

        return res.status(201).send(editedPoll);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error.message);
    }
};

module.exports = { getPolls, createPoll, deletePoll, vote };
