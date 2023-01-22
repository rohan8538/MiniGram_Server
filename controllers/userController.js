const User = require("../models/User");
const { error, success } = require("../utils/responseWrapper");

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
            
            followerIndex = userToFollowDetails.followers.indexOf(currUserDetails);
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

module.exports = {
    followUnfollowUser,
    getPostsOfFollowing
};