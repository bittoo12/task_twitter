const helper = require('../helper/helper');
const authroute = require('../middleware/auth');
const PostModel = require('../models/post');
const userTable = require('../models/userTable');
const followerFollowingTable = require('../models/userFollower');


module.exports = {

    addPostByUser: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }


            const data = req.body;

            if (!data.title) {
                return res.json(helper.showValidationErrorResponse("TITLE_IS_REQUIRED"));
            }
            if (!data.description) {
                return res.json(helper.showValidationErrorResponse("DESCRIPTION_IS_REQUIRED"));
            }
            if (!data.image) {
                return res.json(helper.showValidationErrorResponse("IMAGE_IS_REQUIRED"));
            }

            data.userId = verifydata._id;
            data.userDetails = verifydata._id;

            PostModel.addPost(data, async (err, resdata) => {
                if (err) {
                    return res.json(helper.showDatabaseErrorResponse("ERROR_IN_DB_QUERY"))
                } else {
                    //add post id to user data
                    userTable.findOneAndUpdate(
                        {
                            _id: verifydata._id
                        },
                        {
                            postCount: verifydata.postCount + 1,
                            $addtoset: {
                                posts: resdata._id
                            }
                        }
                    )

                    return res.json(helper.showSuccessResponse("POST_ADDED", resdata))
                }
            })





        } catch (err) {
            return res.json(helper.showInternalServerErrorResponse("INTERNAL_SERVER_ERROR"))
        }
    },

    getPostById: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
            var PostResponse = await PostModel.getPostByIdAsync(req.params._id);
            return res.json(helper.showSuccessResponse('GET_POST_DETAIL_SUCCESS', PostResponse));
        }
        catch (err) {
            console.log("check error ", err);
            res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    updatePost: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
            const data = req.body;

            if (!data.postId) {
                return res.json(helper.showValidationErrorResponse("POST_ID_IS_REQUIRED"));
            }

            PostModel.updatePostByIdAsync(data,(err,resdata)=>{
                if (err) {
                    return res.json(helper.showDatabaseErrorResponse("ERROR_IN_DB_QUERY"))
                } else {
                   

                    return res.json(helper.showSuccessResponse("POST_UPDATED", resdata))
                }
            
            })



        } catch (err) {
            return res.json(helper.showInternalServerErrorResponse("INTERNAL_SERVER_ERROR"));
        }
    },

    removePost: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
            const data = req.body;

            if (!data.postId) {
                return res.json(helper.showValidationErrorResponse("POST_ID_IS_REQUIRED"));
            }

            PostModel.removePost(data,(err,resdata)=>{
                if (err) {
                    return res.json(helper.showDatabaseErrorResponse("ERROR_IN_DB_QUERY"))
                } else {
                      //remove post id to user data
                      userTable.findOneAndUpdate(
                        {
                            _id: verifydata._id
                        },
                        {
                            postCount: verifydata.postCount - 1,
                            $pull: {
                                posts: resdata._id
                            }
                        }
                    )

                    return res.json(helper.showSuccessResponse("POST_REMOVED", resdata))
                }
            
            })



        } catch (err) {
            return res.json(helper.showInternalServerErrorResponse("INTERNAL_SERVER_ERROR"));
        }
    },
    allFollowersPost : async (req,res) => {
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
            var getAllFollowers = await followerFollowingTable.getAllFollowing(verifydata._id.toString());
            var userAr = [];
            for(var i=0;i<getAllFollowers.length;i++) {
                userAr.push(getAllFollowers[i].userDetails.toString())
            }
            PostModel.getAllPostsWithFilter(userAr,sortByField, sortOrder, paged, pageSize,(err,resdata)=>{
                if(err) {
                    return res.json(helper.showDatabaseErrorResponse("Error in DB query"))
                }else {
                    return res.json(helper.showSuccessResponse("DATA_FOUND",resdata))
                }
            })

        }catch(err) {
            return res.json(helper.showInternalServerErrorResponse("INTERNAL_SERVER_ERROR"));
        }
    }


}