var mongoose = require('mongoose');

var PostSchema = mongoose.Schema({
    userId: { type: String },
    userDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date }
}, {
    versionKey: false // You should be aware of the outcome after set to false
});

const Post = module.exports = mongoose.model('post', PostSchema);

module.exports.addPost = function (data, callback) {
    data.createdAt = new Date();
    return Post.create(data, callback);
}

module.exports.removePost = function (data, callback) {
    var query = { _id: data.postId };
    return Post.deleteOne(query, callback);
}




module.exports.getPostByIdAsync = (postId, callback) => {
    return Post.findOne({ _id: postId }).populate('userDetails').exec(callback);
}


module.exports.updatePostByIdAsync = (data, callback) => {
    var query = { _id: data.postId };
    Post.findOneAndUpdate(query, data, { upsert: true, "new": true }, callback);
}


module.exports.getAllPostsWithFilter = (data, sortByField, sortOrder, paged, pageSize, callback) => {
    Post.aggregate([
        { userDetails: { $in: [data.users] } },
        {
            $lookup:
            {
                from: 'users',
                localField: 'userDetails',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: { path: '$userDetails', includeArrayIndex: '0', preserveNullAndEmptyArrays: true } },
        { $sort: { [sortByField]: parseInt(sortOrder) } },
        { $skip: (paged - 1) * pageSize },
        { $limit: parseInt(pageSize) },
    ], callback)
}




