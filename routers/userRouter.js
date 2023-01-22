const router = require('express').Router();
const userController = require('../controllers/userController')
const loginChk = require('../middlewares/loginChk');

router.post('/followUnfollow', loginChk, userController.followUnfollowUser);
router.post('/posts', loginChk, userController.getPostsOfFollowing);

module.exports = router;