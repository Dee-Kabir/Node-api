const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");


exports.getPosts = (req,res) => {
    Post.find()
    .populate("postedBy","_id name")
    .populate("comments","text created")
    .populate("comments.postedBy","_id name")
    .select("_id title body created likes")
    .sort({ created : -1})
    .then(posts => {
       
        res.json(posts)
    })
    .catch(err=> console.log(err));
};

exports.createPost = (req,res) => {
    let form = formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(err, fields, files) => {
        if(err){
            return res.status(400).json({
                error:"There is an error while creating this post"
            })
        }
        let post = new Post(fields)
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        post.postedBy = req.profile
        if(files.photo){
            post.photo.data = fs.readFileSync(files.photo.path)
            post.photo.contentType = files.photo.type
        }
        post.save((err, result) =>{
            if(err){
                return res.status(400).json({
                    error:err
                })
            }
            else{
                res.json(result)
            }
        })
    })
};

exports.postsByUser = (req,res) => {
    Post.find({postedBy: req.profile._id})
    .populate("postedBy","_id name")
    .select("_id title body created likes")
    .sort("created")
    .exec((err, posts) => {
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        console.log(posts);
        res.json(posts);
    })
};

exports.postById = (req, res,next, id) => {
    Post.findById(id)
    .populate('postedBy', '_id name')
    .populate("comments","text created")
    .populate("comments.postedBy","_id name")
    .populate('postedBy', '_id name role')
    .select('_id title body created comments photo likes')
    .exec((err,post) => {
        if(err || !post){
            console.log(post)
            return res.status(400).json({
                error:"There is an error while fetching this post"
            })
        }
        console.log(post);
        req.post = post;
        
        next();
    })
};
exports.isPoster = (req,res,next) => {
    let isPoster =req.post && req.auth && req.post.postedBy._id == req.auth._id
    if(!isPoster){
        return res.status(403).json({
            error:"User not authorized"
        });
    }
    next();
};

exports.deletePost = (req,res) => {
    let post = req.post;
    post.remove((err,post) => {
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.json({
            message:"deleted successfully"
        });
    })
}

exports.updatePost = (req,res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(error,fields,files) => {
        if(error){
            return res.status(400).json({
                error:"There is an error while uploading Photo"
            })
        }
        let post = req.post
        post = _.extend(post, fields);
        if(files.photo){
            post.photo.data = fs.readFileSync(files.photo.path)
            post.photo.contentType = files.photo.type
        }
        post.updated = Date.now();
        post.save((err,result) => {
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
exports.postPhoto = (req,res,next) => {
    if(req.post.photo.data){
        res.set("Content-Type",req.post.photo.contentType);
        return res.send(req.post.photo.data);
    }
    next();
};
exports.singlePost = (req,res) => {
    return res.json(req.post)
}
exports.like = (req,res) => {
    Post.findByIdAndUpdate(req.body.postId,{
        $push: {likes:req.body.userId}
    },
    {new:true}).exec((err,result)=>{
        if(err){
            return(
                res.status(400).json()
            )
        }else{
            res.json(result);
        }
    })
}
exports.unlike = (req,res) => {
    Post.findByIdAndUpdate(req.body.postId,{
        $pull: {likes:req.body.userId}
    },
    {new:true}).exec((err,result)=>{
        if(err){
            return(
                res.status(400).json()
            )
        }else{
            res.json(result);
        }
    })
};
exports.comment = (req, res) => {
    let comment = req.body.comment;
    comment.postedBy = req.body.userId;
    Post.findByIdAndUpdate(req.body.postId,{
        $push: {comments:comment}
    },
    {new:true})
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return(
                res.status(400).json()
            )
        }else{
            console.log(result)
            res.json(result);
        }
    })
}
exports.uncomment = (req, res) => {
    Post.findByIdAndUpdate(req.body.postId,{
        $pull: {comments:req.body.comment}
    },
    {new:true})
    .populate("comments.postedBy","_id name")
    .populate("postedBy","_id name")
    .exec((err,result)=>{
        if(err){
            return(
                res.status(400).json()
            )
        }else{
            res.json(result);
        }
    })
}