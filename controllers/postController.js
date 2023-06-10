const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2;


// getAllPostsController = async (req, res) => {
//     console.log(req._id);
//     return res.send(success(200, "There you go with all the posts."));
// };

const createPostController = async (req, res) => {
    try {
       // return res.send("this api was hit successfully");
        const owner = req._id;
        const {caption, postImg} = req.body;

        if(!caption || !postImg) {
            return res.send(error(400, 'Image and caption both are required'));
        }
            const cloudImg = await cloudinary.uploader.upload(postImg, {
                folder: 'postImg'
            })
        
        const user = await User.findById(owner);
    
        const post = await Post.create({
            owner,
            caption,
            image: {
                publicId: cloudImg.public_id,
                url: cloudImg.url
            }
        });

        user.posts.push(post._id);
        await user.save();

        return res.json(success(200, {post}));

    } catch (e) {
        res.send(error(500, e.message));
       // console.log(e);
    }
    
}

const likeAndUnlikePostController = async (req, res) => {
    try {
        const {postId} = req.body;
        const owner = req._id;

        const post = await Post.findById(postId);
        if(!post){
            return res.send(error(404, 'Post not found'));
        }

        if(post.likes.includes(owner)) {
            const index = post.likes.indexOf(owner);
            post.likes.splice(index, 1);
            
            await post.save();
            return res.send(success(200, 'Post unliked'));
        }

        else {
            post.likes.push(owner);
            await post.save();
            return res.send(success(200, 'Post liked'));
        }

    } catch (e) {
        res.send(error(500, e.message));
    }
}

const updatePostController = async (req, res) => {
    try {
        const currUser = req._id;
        const { postId, caption } = req.body;

        const postDetails = await Post.findById(postId);

        if(!postDetails) {
            return res.send(error(404, 'Post does not exist'));
        }

        if(postDetails.owner.toString() != currUser){
            return res.send(error(403, 'You are not the owner of this post'));
        }

        if(caption) {
            postDetails.caption = caption;
        }

        await postDetails.save();
        res.send(success(200, postDetails));

    } catch (e) {
        res.send(error(500, e.message));
    }
};

const deletePostController = async (req, res) => {
    try {
        const { postId } = req.body;
        const currUser = req._id;

        const postDetails = await Post.findById(postId);
        const currUserDetails = await User.findById(currUser);

        if(!postDetails){
            return res.send(error(404, 'Post not present'));
        }

        if(postDetails.owner.toString() != currUser) {
            return res.send(error(403, 'You are not the owner of this post'));
        }

        const indexOfPost = currUserDetails.posts.indexOf(postId);
        await currUserDetails.posts.splice(indexOfPost, 1);
        await currUserDetails.save();
        await postDetails.remove();

        return res.send(success(200, postDetails));
        
    } catch (e) {
        res.send(error(500, e.message));
    }
    

}

module.exports = { createPostController, likeAndUnlikePostController, updatePostController, deletePostController };