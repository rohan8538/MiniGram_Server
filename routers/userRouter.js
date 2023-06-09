const router = require('express').Router();
const userController = require('../controllers/userController')
const loginChk = require('../middlewares/loginChk');

router.post('/followUnfollow', loginChk, userController.followUnfollowUser);
router.post('/posts', loginChk, userController.getPostsOfFollowing);
router.post('/myPosts', loginChk, userController.getMyPosts);
router.post('/userPosts', loginChk, userController.getUserPosts);
router.delete('/', loginChk, userController.deleteMyProfile);
router.get('/myDetails', loginChk, userController.getMyInfo);
router.put('/', loginChk, userController.updateUserProfile);
router.post('/getUserProfile', loginChk, userController.getUserProfile);

module.exports = router;   