var mongoose = require('mongoose');

var UserFollowerSchema = mongoose.Schema({
    userId:                     { type: String },
    userDetails:                { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followerId:                 { type: String },
    followerDetails:            { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt:                  { type: Date },
    createdAt:                  { type: Date }
},{
    versionKey: false // You should be aware of the outcome after set to false
});

const UserFollower = module.exports = mongoose.model('userFollower', UserFollowerSchema);

module.exports.followUser = function (data, callback) {
    data.createdAt = new Date();
    return UserFollower.create(data, callback);
}

module.exports.unfollowUser = function (data, callback) {
    var query = { userId: data.userId, followerId: data.followerId };
    return UserFollower.deleteOne(query, callback);
}

module.exports.getFollowingWithFilter = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    UserFollower.aggregate([
        { $match: obj },
        { $lookup: { from: 'users', localField: 'userDetails', foreignField: '_id', as: 'userDetails'} },
        { $unwind: { path: '$userDetails', includeArrayIndex: '0', preserveNullAndEmptyArrays:true } },
        { $sort: { [sortByField]:  parseInt(sortOrder) } },
        { $skip: (paged-1)*pageSize },
        { $limit: parseInt(pageSize) },
    ],callback);
}

module.exports.getAllFollowing = function(id) {
    var query = {
        followerId: id
    }

    return UserFollower.find(query,{userDetails:1})
}

module.exports.getFollowersWithFilter = function (obj, sortByField, sortOrder, paged, pageSize, callback) {
    UserFollower.aggregate([
        { $match: obj },
        { $lookup: { from: 'users', localField: 'followerDetails', foreignField: '_id', as: 'followerDetails'} },
        { $unwind: { path: '$followerDetails', includeArrayIndex: '0', preserveNullAndEmptyArrays:true } },
        { $sort: { [sortByField]:  parseInt(sortOrder) } },
        { $skip: (paged-1)*pageSize },
        { $limit: parseInt(pageSize) },
    ],callback);
}