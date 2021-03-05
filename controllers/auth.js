const User = require("../models/user");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const { errorHandler } = require('../helpers/dbErrorHandler');

const _ = require("lodash");
const fs = require("fs");
const expressJwt = require("express-jwt");
const { json } = require("body-parser");
exports.signup = (req,res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(err, fields, files)=>{
        if(err){
            return res.status(400).json({
                err:"There is an error"
            });
        }
        let user = new User(fields);

        user.save((err,user) => {
            if(err){
                return res.status(400).json({
                    error:"User Already exists"
                });
                
            }
            user.salt = undefined;
            user.hashed_password = undefined;
            res.json({ user });
        });
    });
};

exports.signin = (req,res) => {
    const {email, password } = req.body;
    User.findOne({email: email},(err, user) => {
        if(err || !user){
            return res.status(400).json({
                error:"No user exists"
            });
        }
        if(!user.authenticate(password)){
            return res.status(401).json({
                error: 'Invalid Email or password'
            });
        }
        const token = jwt.sign({_id:user._id},process.env.jwtstring);
        res.cookie('t',token,{expire: new Date() + 999});
        const {_id, name, email, role} = user;
        return res.json({
            token,
            user:{_id,name,email,role}
        });
    });
};

exports.signout = (req,res) => {
    res.clearCookie("t");
    res.json({
        message:"You are logged out!!"
    })
};

exports.requireSignIn = expressJwt({
    secret: process.env.jwtstring,
    algorithms: ["HS256"],
    userProperty: "auth"
});

exports.isAuth = (req,res,next) =>{
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!req.profile){
        return res.status(403).json({
            error: "No user exists"
        });
    }
    if(!user){
        return res.status(403).json({
            error: "Access denied"
        });
    }
    next();
}
exports.isAdmin = (req, res, next) => {
    if(req.profile.role === 0){
        return res.status(403).json({
            error: "Admin resources! Access denied"
        });
    }
    next();
};