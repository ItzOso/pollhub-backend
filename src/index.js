const express = require("express");
const app = express();

const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

// middlewares
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors({origin:"https://pollhub-frontend.onrender.com"}));
router.use([ '/login', '/polls', "/create-poll", "/signup", ], express.static(path.join(__dirname, '../dist/')));
dotenv.config();

const Auth = require("./Routes/auth");
app.use("/auth", Auth);
const Polls = require("./Routes/polls")
app.use("/api", Polls)

mongoose.set("strictQuery", true);

// connect to database and start the server
mongoose
    .connect(process.env.MONGO_CONNECT_URI, () => {
        console.log("Database connected");
        app.listen(process.env.PORT || 8080, () => {
            console.log(`Server running at http://localhost:${process.env.PORT}`);
        });
    })
    .catch((error) => console.log(error.message));
