var mongoose = require('mongoose');
const ObjectId = require('objectid');

var userSchema = mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },

    email: { type: String },
    mobileNumber: { type: String },
    countryCode: { type: String },
    password: { type: String, default: "none" },
    profileImage: { type: String },
    coverImage: { type: String },
    dob: { type: String },
    gender: { type: String },
    OTP: { type: String },
    OTPexp: { type: Date },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
    token: { type: String },

    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

    postCount: { type: Number, default: 0 },

    isBlocked: { type: Boolean, default: false },





    createdAt: { type: Date },
    updatedAt: { type: Date },



    isFollowing: { type: Boolean, default: false },


}, {
    versionKey: false // You should be aware of the outcome after set to false
});



const User = module.exports = mongoose.model('User', userSchema);








module.exports.addUser = function (data, callback) {

    data.createdAt = new Date();
    User.create(data, callback);
}









module.exports.getUserByIdProfile = (id, callback) => {
    User.findById(id, { "password": 0 })
        .exec(callback);
}














module.exports.updateUserProfile = (data) => {
    var query = { _id: data._id };
    return User.findOneAndUpdate(query, data, { "fields": { password: 0 }, "new": true }).exec();
}



module.exports.updateOTP = (data, callback) => {
    var query = { _id: data.userId };
    var update = {
        token: data.token,
        OTP: data.OTP,
        OTPexp: data.OTPexp
    }
    return User.findOneAndUpdate(query, update, { "fields": { password: 0 }, "new": true }, callback);
}



module.exports.updatePassword = (data, options, callback) => {
    var query = { _id: data._id };
    var update = {
        password: data.password,
        updatedAt: new Date()
    }
    return User.findOneAndUpdate(query, update, options, callback);
}



module.exports.updateToken = (data) => {
    var query = { _id: data._id };
    var update = {
        token: data.token,
        firebaseToken: data.firebaseToken
    }
    return User.findOneAndUpdate(query, update, { "fields": { password: 0 }, "new": true })
        .populate('userWallet')
        .exec()
}

module.exports.custAuth = (data) => {
    return User.findOne({ _id: data.customerid, token: data.token });
}




















