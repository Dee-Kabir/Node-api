const express = require("express");
const router = express.Router();
const {requireSignIn} = require("../controllers/auth");
const {userById} = require("../controllers/user");
const {like,unlike,getPosts, createPost,postById,singlePost,comment,uncomment, postsByUser,postPhoto, isPoster, updatePost, deletePost} = require("../controllers/post");

// 
router.put('/post/like',requireSignIn,like);
router.put('/post/unlike',requireSignIn,unlike);

router.put('/post/comment',requireSignIn,comment);
router.put('/post/uncomment',requireSignIn,uncomment);

router.get("/post/photo/:postId",postPhoto)
router.get("/posts",getPosts);

router.post("/post/new/:userId",requireSignIn,createPost);
router.get("/posts/by/:userId",requireSignIn,postsByUser)
router.put("/posts/:postId",requireSignIn,isPoster,updatePost);
router.get('/post/:postId',singlePost)
router.delete("/post/:postId",requireSignIn,isPoster,deletePost);
// 

router.param("postId",postById);
router.param("userId",userById);

module.exports = router;