const express = require('express');
const router = express.Router();
const followerController = require('../../controller/followerController');

router.post('/getFollowers', followerController.getFollowersList);

router.post('/getFollowings', followerController.getFollowingList);

router.post('/follow', followerController.followUser);

router.post('/unfollow',followerController.unfollowUser);

module.exports = router;