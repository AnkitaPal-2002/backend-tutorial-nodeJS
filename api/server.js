const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const uploadResult = require('./utils/cloudinary');

dotenv.config();
const db = require('./config/db');

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.urlencoded({ extended : true}));
app.use(express.static("public"));
app.use(cookieParser());


db();
uploadResult();

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



