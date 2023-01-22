const router = require('express').Router();
const postController = require('../controllers/postController');
const loginChk = require('../middlewares/loginChk');

// router.get("/allPosts", loginChk, postController.getAllPostsController);
router.post("/", loginChk, postController.createPostController);
router.post("/likeUnlike", loginChk, postController.likeAndUnlikePostController);
router.put("/", loginChk, postController.updatePostController);
router.delete("/", loginChk, postController.deletePostController);


module.exports = router;