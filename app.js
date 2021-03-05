const express = require("express");
const dotenv = require("dotenv");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const fs = require("fs");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");


const app = express();

mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true
}).then(()=>(
    console.log("connected to database")
));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.get("/",(req,res) => {
    fs.readFile('docs/apiDocs.json',(err, data) => {
        if(err){
            res.status(400).json({
                error:err
            })
        }
        console.log(data)
        const docs = JSON.parse(data)
        res.json(docs);
    })
})
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/p',postRoutes);

app.listen(8000, ()=>{
    console.log("Server statrted at port 8000");
})