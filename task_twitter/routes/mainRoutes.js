module.exports = function (app) {
    // importing routes files for routes /////

    var user = require('./customer/users');
    app.use('/api/v1/user', user);


    var follower = require('./customer/follower');
    app.use('/api/v1/follower', follower);


    var post = require('./post/post');
    app.use('/api/v1/post', post);
 
};