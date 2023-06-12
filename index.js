const express = require("express");
const dotenv = require("dotenv");
const authRouter = require("./routers/authRouter");
const dbConnect = require("./dbConnect");
const postRouter = require('./routers/postRouter');
const userRouter = require('./routers/userRouter');
const morgan = require("morgan");
const { success } = require("./utils/responseWrapper");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

dotenv.config("./.env");

// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const app = express();

// Middleware
//app.use(express.json());
app.use(express.json({limit: '10mb'}));
//app.use(express.urlencoded({limit: '50mb'}));
app.use(morgan("common"));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

//Redirect URLs
app.use("/auth", authRouter);
app.use("/createPost", postRouter);
app.use("/post/likePost", postRouter)
app.use("/post", userRouter);
app.use("/user", userRouter)
app.get("/", (req, res) => {
    res.send(success(200, "Response received successfully from server"));
});

const PORT = process.env.PORT

dbConnect();

app.listen(PORT, () => {
    console.log(`listening to port: ${PORT}`);
});