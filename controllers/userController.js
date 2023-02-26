const Post = require("../models/Post");
const User = require("../models/User");
const { post } = require("../routers/userRouter");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2;

const followUnfollowUser = async (req, res) => {
    try {
        const {userToFollow} = req.body;
        const currUser = req._id;

        if(userToFollow === currUser) {
            res.send(error(409, 'Are you mad. You cannot follow yourself'));
            console.log('Senseless person, Trying to follow himself');
        }
    
        const currUserDetails = await User.findById(currUser);
        const userToFollowDetails = await User.findById(userToFollow);
    
        if(!userToFollowDetails) {
            return res.send(error(404, 'user not found'));
        }
    
        if(currUserDetails.followings.includes(userToFollow)) {
            const followingIndex = currUserDetails.followings.indexOf(userToFollow);
            currUserDetails.followings.splice(followingIndex, 1);
            
            const followerIndex = userToFollowDetails.followers.indexOf(currUserDetails);
            userToFollowDetails.followers.splice(followerIndex, 1);
    
            await userToFollowDetails.save();
            await currUserDetails.save();
    
            return res.send(success(200, 'User Unfollowed'));

        } else {
            userToFollowDetails.followers.push(currUser);
            currUserDetails.following.push(userToFollow);

            await userToFollowDetails.save();
            await currUserDetails.save();

            return res.send(success(200, 'User followed'));
        }
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
};

const getPostsOfFollowing = async (req, res) => {
    try {
        const currUser = req._id;
        const currUserDetails = await User.findById(currUser);

        const posts = await Post.find({
            'owner': {
                '$in': currUserDetails.following
            }
        });

        return res.send(success(200, posts));
    } catch (e) {
        console.log(e);
        return res.send(error(500, e.message));
    }
    
};

const getMyPosts = async (req, res) => {
    try {
        const currUser = req._id;
        const currUserPosts = await Post.find({
            'owner': currUser
        }).populate('likes');

        return res.send(success(200, {currUserPosts}));
    } catch (e) {
        console.log(error(500,e.message));
    }
};

const getUserPosts = async (req, res) => {
    try {
        const {userPostToFind} = req.body;

        if(!userPostToFind) {
            return res.send(error(400, 'User id of the user is required'));
        }

        const userPosts = await Post.find({
            'owner': userPostToFind
        }).populate('likes');

        return res.send(success(200, {userPosts}));
    } catch (e) {
        console.log(error(500, e.message));
    }
}

const deleteMyProfile = async (req, res) => {
    try {
        const currUser = req._id;
        const currUserDetails = await User.findById(currUser);

        // Deleting All posts
        await Post.deleteMany({
            'owner': currUser
        });

        // Deleting from followers and following list
        // Removing from followers
        currUserDetails.followers.forEach(async (follower) => {
            const currFollower = await User.findById(follower);
            const index = currFollower.following.indexOf(currUser);
            currFollower.following.splice(index, 1);
            await currFollower.save();
        });

        // Removing from following
        currUserDetails.following.forEach(async (currFollowing) => {
            const currFollowingDetails = await User.findById(currFollowing);
            const index = currFollowingDetails.followers.findById(currUser);
            currFollowingDetails.following.splice(index, 1);
            await currFollowingDetails.save();
        });

        // Removing user from likes
        const allPosts = await Post.find();
        allPosts.forEach(async (post) => {
            const index = post.likes.indexOf(currUser);
            post.likes.splice(index, 1);
            await post.save();
        });

        // DeletingUser
        await currUser.remove();

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        });

        return res.send(success(200, 'user Deleted'));

    } catch (e) {
        console.log(error(500, e.message));
    }
}

const getMyInfo = async (req, res) => {
    try {
        const user = await User.findById(req._id);
        return res.send(success(200, {user}));
    } catch (e) {
        res.send(error(500, e.message));
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio, userImg} = req.body;

        const user = await User.findById(req._id);

        if(firstName) {
            user.firstName = firstName;
        }

        if(lastName) {
            user.lastName = lastName;
        }

        if(bio) {
            user.bio = bio;
        }

        if(userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: 'profileImg'
            })
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id,
            }
        }
        await user.save();
        return res.send(success(200, { user }));

    } catch (e) {
        return res.send(error(500, e.message))
    }
}
module.exports = {
    followUnfollowUser,
    getPostsOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile
};