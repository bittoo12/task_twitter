const authroute = require('../middleware/auth');
const userFollower = require('../models/userFollower');
const ObjectId = require('objectid');
const User = require('../models/userTable.js');

module.exports = {

    getFollowersList: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
            const data = req.body;
            const pageSize       = data.limit  || 10;
            const sortByField    = data.orderBy || "createdAt";
            const sortOrder      = data.order   || -1;
            const paged          = data.page || 1;

            let obj = {};
            if(data.fieldName && data.fieldValue) obj[data.fieldName]={ $regex : data.fieldValue || '', $options : 'i'};
            if(data.startDate) obj.createdAt =  { $gte : new Date(data.startDate) };
            if(data.endDate) obj.createdAt =  { $lte : new Date(data.endDate) };
            if(data.filter){
              obj['$and'] = [];
              obj['$and'].push({name: { $regex : data.filter || '', $options : 'i'}})
            }
            obj.userId = verifydata._id.toString();
            let count = await userFollower.aggregate([{ $match: obj },{ $group: { _id: null, count: { $sum: 1 } } }]);
            let totalcount = count.length>0?count[0].count:0;
            userFollower.getFollowersWithFilter(obj, sortByField, sortOrder, paged, pageSize, (err, resdata) => {
                if (err) {
                    return res.json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                } 
                else {
                    if (resdata.length === 0) {
                        return res.json(helper.showSuccessResponse('NO_DATA_FOUND', []));
                    } else {
                        return res.json(helper.showSuccessResponseCount('DATA_SUCCESS', resdata, totalcount));
                    }
                }
            });
        }
        catch (err) {
            console.log("Server error", err);
            return res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    getFollowingList: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
            const data = req.body;
            const pageSize       = data.limit  || 10;
            const sortByField    = data.orderBy || "createdAt";
            const sortOrder      = data.order   || -1;
            const paged          = data.page || 1;

            let obj = {};
            if(data.fieldName && data.fieldValue) obj[data.fieldName]= { $regex : data.fieldValue || '', $options : 'i'};
            if(data.startDate) obj.createdAt =  { $gte : new Date(data.startDate) };
            if(data.endDate) obj.createdAt =  { $lte : new Date(data.endDate) };
            if(data.filter){
              obj['$and'] = [];
              obj['$and'].push({name: { $regex : data.filter || '', $options : 'i'}})
            }
            obj.followerId = verifydata._id.toString();
            let count = await userFollower.aggregate([{ $match: obj },{ $group: { _id: null, count: { $sum: 1 } } }]);
            let totalcount = count.length>0?count[0].count:0;
            userFollower.getFollowingWithFilter(obj, sortByField, sortOrder, paged, pageSize, (err, resdata) => {
                if (err) {
                    return res.json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                } 
                else {
                    if (resdata.length === 0) {
                        return res.json(helper.showSuccessResponse('NO_DATA_FOUND', []));
                    } else {
                        return res.json(helper.showSuccessResponseCount('DATA_SUCCESS', resdata, totalcount));
                    }
                }
            });
        }
        catch (err) {
            console.log("Server error", err);
            return res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    followUser: async (req, res) => {
        try {
            var data = req.body;
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
            if (!data.userId) {
                return res.json(helper.showValidationErrorResponse('USERID_REQUIRED'));
            }
            var user = await User.findOne({_id: ObjectId(data.userId) });
            if(!user){
                return res.json(helper.showValidationErrorResponse('USER_NOT_FOUND'));
            }
            var alreadyFollow = await userFollower.findOne({ userId: data.userId, followerId: verifydata._id.toString()});
            if(alreadyFollow){
                return res.json(helper.showValidationErrorResponse('ALREADY_FOLLOW'));
            }
            else{
                let model = {
                    userId: data.userId,
                    userDetails:  data.userId,
                    followerId: verifydata._id.toString(),
                    followerDetails: verifydata._id.toString(),
                }
                var followResponse = await userFollower.followUser(model);

                let followerModel = {
                    followerCount: user.followerCount + 1,
                    _id: data.userId
                }
                await User.updateUserProfile(followerModel);


                let followingModel = {
                    followingCount: verifydata.followingCount + 1,
                    _id: verifydata._id
                }
                await User.updateUserProfile(followingModel);

                return res.json(helper.showSuccessResponse('FOLLOW_SUCCESS', followResponse ));
            }
        }
        catch (err) {
            console.log("check error ", err);
            res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    unfollowUser: async (req, res) => {
        try {
            var data = req.body;
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
            if (!data.userId) {
                return res.json(helper.showValidationErrorResponse('USERID_REQUIRED'));
            }

            var user = await User.findOne({_id: ObjectId(data.userId) });
            if(!user){
                return res.json(helper.showValidationErrorResponse('USER_NOT_FOUND'));
            }

            var follower = await userFollower.findOne({ userId: data.userId, followerId: verifydata._id.toString()});
            if(!follower){
                return res.json(helper.showValidationErrorResponse('NOT_FOLLOW'));
            }
            else{
                let model = {
                    userId: data.userId,
                    followerId: verifydata._id.toString(),
                }
                var unfollowResponse = await userFollower.unfollowUser(model);

                let followerModel = {
                    followerCount: user.followerCount - 1,
                    _id: data.userId
                }
                await User.updateUserProfile(followerModel);

                let followingModel = {
                    followingCount: verifydata.followingCount - 1,
                    _id: verifydata._id
                }
                await User.updateUserProfile(followingModel);

                return res.json(helper.showSuccessResponse('UNFOLLOW_SUCCESS', unfollowResponse ));
            }
        }
        catch (err) {
            console.log("check error ", err);
            res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    }
}