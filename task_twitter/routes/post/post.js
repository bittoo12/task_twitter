const express = require('express');
const router = express.Router();
const postController = require('../../controller/postController');



router.get('/detailById/:_id', postController.getPostById);

router.post('/add', postController.addPostByUser);

router.post('/update', postController.updatePost);

router.post('/remove',postController.removePost);

router.post('/all/followerspost',postController.allFollowersPost);



module.exports = router;