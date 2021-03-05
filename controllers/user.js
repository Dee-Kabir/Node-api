const User = require("../models/user");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require('fs');

exports.userById = (req,res,next,id) => {

    User.findById(id)
    .populate('following','_id name')
    .populate('followers','_id name')
    .exec((err, user)=>{
        if(err|| !user){
            return res.status(400).json({
                error:"User not found"
            })
        }

        req.profile = user;
        next();
    });
};

exports.read = (req,res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(
        req.profile
    );
}

exports.update = (req,res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(error,fields,files) => {
        if(error){
            return res.status(400).json({
                error:"There is an error while uploading Photo"
            })
        }
        let user = req.profile;
        user = _.extend(user,fields)
        if(files.photo){
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }
        user.save((err,result) => {
            if(err){
                return res.stattus(400).json({
                    error:"There is an error in datastore"
                })
            }else{
                res.json(result)
            }
        })
    })
};
exports.remove = (req,res) => {
    User.deleteOne({_id:req.profile._id},(err,user)=>{
        if(err){
            return res.stattus(400).json({
                error:"The profile is deleted"
            })
        }
        res.json(user);
    });
};

exports.photo = (req,res,next) =>{
    if(req.profile.photo.data){
        res.set("Content-Type",req.profile.photo.contentType);
        res.send(req.profile.photo.data);
    }
    next();
};

exports.allusers = (req,res) => {
    User.find((err,users)=>{
        if(err){
            return response.status(400).json({
                error:"Unable to fetch users!!"
            })
        }else{
            return res.json(users);
        }
    }).select("name email updated photo");
};

exports.following = (req,res,next) => {
    
    User.findByIdAndUpdate(req.body.userId, {
        $push:{following: req.body.followId}
    },(err, result) => {
        if(err) {
            console.log("error in following")
            return res.status(400).json({error: err});
        }
        next();
    })
};
exports.follow = (req,res) => {

    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.body.userId}
    },
    {new:true})
    .populate('following','_id name')
    .populate('followers','_id name')
    .exec((err,result)=>{
        if(err){
            return res.status(400).json({
                error:"This user doesn't exists"
            })
        }
       
        result.hashed_password = undefined
        result.salt = undefined
        console.log("result",result);
        res.json(result)
    })
}
exports.removefollowing = (req,res,next) => {
    console.log("request",req.body);
    User.findByIdAndUpdate(req.body.userId, {
        $pull:{following: req.body.unfollowId}
    },(err, result) => {
        if(err) {
            return res.status(400).json({error: err});
        }
        next();
    })
};
exports.removefollow = (req,res) => {
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.body.userId}
    },
    {new:true})
    .populate('following','_id name')
    .populate('followers','_id name')
    .exec((err,result)=>{
        if(err){
            return res.status(400).json({
                error:"This user doesn't exists"
            })
        }
        result.hashed_password = undefined
        result.salt = undefined
        res.json(result)
    })
}