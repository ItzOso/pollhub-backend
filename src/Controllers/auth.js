const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../Models/userSchema");

const handleSignup = async (req, res) => {
    try {
        if (!validator.isEmail(req.body.email)) return res.status(400).send({ error: "Please enter a valid email!" });
        if (req.body.password.length < 8)
            return res.status(400).send({ error: "Password must contain at least 8 characters!" });
        const userExists = await User.find({ email: req.body.email });
        if (userExists.length) return res.status(409).send({ error: "Account already exists!" });
        const usernameTaken = await User.find({ username: req.body.username });
        if (usernameTaken.length) return res.status(409).send({ error: "Username taken! Please try another one." });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        res.status(201).send(user);
    } catch (error) {
        return res.status(500).send(error);
    }
};

const handleLogin = async (req, res) => {
    try {
        // check if email is connected to an account, compare passwords, create jwt
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).send({ error: "Email or password are incorrect!" });

        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match) return res.status(401).send({ error: "Email or password are incorrect!" });

        const token = jwt.sign(
            {
                _id: user._id,
                username: user.username,
                email: user.email,
                password: user.password,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).send({
            _id: user._id,
            username: user.username,
            email: user.email,
            token,
        });
    } catch (error) {
        return res.status(500).send(error);
    }
};

const verifyToken = async (req, res) => {
    res.status(200).send({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email
    })
}

module.exports = { handleSignup, handleLogin, verifyToken };