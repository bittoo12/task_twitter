const User = require('../models/userTable.js');

const jwt = require('jsonwebtoken');
const authroute = require('../middleware/auth.js');
var validator = require('validator');
var upload = require('../lib/awsimageupload.js');
const profileImageUpload = upload.any();
const deleteaws = require('../lib/awsdelete.js');
const helper = require('../helper/helper')




module.exports = {

    userRegister: async (req, res) => {
        try {
            var data = req.body;
            console.log("===check body dataa=====", data);
            var userData;
            var paramsList = [
                { name: 'firstName', type: 'string' },
                { name: 'lastName', type: 'string' },
                { name: 'mobileNumber', type: 'string' },
                { name: 'countryCode', type: 'string' },
                { name: 'email', type: 'string' },
                { name: 'password', type: 'string' },
                { name: 'confirmPassword', type: 'string' }
            ];

            helper.checkRequestParams(data, paramsList, async (response) => {
                if (response.status) {
                 
                    if (!data.firstName) {
                        return res.json(helper.showValidationErrorResponse('FIRST_NAME_IS_REQUIRED'));
                    }
                    if (!data.lastName) {
                        return res.json(helper.showValidationErrorResponse('LAST_NAME_IS_REQUIRED'));
                    }
                  
                   
                    
                    if (!data.countryCode) {
                        return res.json(helper.showValidationErrorResponse('CC_IS_REQUIRED'));
                    }
                    if (!data.mobileNumber) {
                        return res.json(helper.showValidationErrorResponse('MOBILE_NUMBER_IS_REQUIRED'));
                    }
                    var mobileExist = await User.findOne({ countryCode: data.countryCode, mobileNumber: data.mobileNumber });
                    if (mobileExist) {
                        return res.json(helper.showValidationErrorResponse('MOBILE_NUMBER_ALREADY_EXIST'));
                    }
                    if (!data.email) {
                        return res.json(helper.showValidationErrorResponse('EMAIL_IS_REQUIRED'));
                    }
                    var emailExist = await User.findOne({ email: data.email });
                    if (emailExist) {
                        return res.json(helper.showValidationErrorResponse('EMAIL_ALREADY_EXIST'));
                    }
                    if (!data.password) {
                        return res.json(helper.showValidationErrorResponse('PASSWORD_IS_REQUIRED'));
                    }
                    if (!data.confirmPassword) {
                        return res.json(helper.showValidationErrorResponse('CNF_PASSWORD_IS_REQUIRED'));
                    }
                    if (data.password != data.confirmPassword) {
                        return res.json(helper.showValidationErrorResponse('PASSWORD_CNFPASSWORD_NOT_MATCH'));
                    }
                    if (!data.dob) {
                        return res.json(helper.showValidationErrorResponse('DOB_IS_REQUIRED'));
                    }
                    
                  
                    
                   
                   
           
                  
                   
                   
                    
                   
                        var hashedPassword = require('crypto').createHash('sha256').update(data.password).digest('hex');
                        var userd = {
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                            password: hashedPassword,
                            profileImage: data.profileImage,
                            coverImage: data.coverImage,
                            mobileNumber: data.mobileNumber,
                            countryCode: data.countryCode,
                            dob: data.dob,
                            token: jwt.sign({ email: data.email, userId: data.password }, 'secret', { expiresIn: "9h" }),
                          
                        }

                        User.addUser(userd, async (err, user) => {
                            if (err) {
                              
                                return res.json(helper.showValidationErrorResponse('USER_REGISTER', err));
                            } 
                            else {
                                res.json(helper.showSuccessResponse('USER_REGISTERED_SUCCESS', user));
                            }
                        });
                
                } else {

                    return res.json(helper.showParamsErrorResponse(response.message));
                }
            });

        } catch (error) {
            return res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    userUpdateProfile: async (req, res) => {
        try {
            var data = req.body;
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }
           
           
            data._id = verifydata._id;
            var updateProfile = await User.updateUserProfile(data);
            res.json(helper.showSuccessResponse('PROFILE_UPDATE_SUCCESS', updateProfile));
        }
        catch (error) {
            console.log("check error ", error);
            res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    userPassword: async (req, res) => {
        try {
            var data = req.body;
            if (!data.mobileNumber && !data.email) {
                return res.json(helper.showValidationErrorResponse('MOBILE_NO_OR_EMAIL_IS_REQUIRED'));
            }
            if (!data.password) {
                return res.json(helper.showValidationErrorResponse('PASSWORD_IS_REQUIRED'));
            }
            if (data.mobileNumber) {
                if (!data.countryCode) {
                    return res.json(helper.showValidationErrorResponse('CC_IS_REQUIRED'));
                }
            }
            if (data.email) {
                if (!validator.isEmail(data.email)) {
                    return res.json(helper.showValidationErrorResponse('EMAIL_INVALID'));
                }
            }
            let query = {
                $or: [
                    { countryCode: data.countryCode, mobileNumber: data.mobileNumber },
                    { email: data.email }
                ]
            };

            console.log(query);

            let userc = await User.findOne(query);
            console.log(userc);
            if (userc == null) {
                return res.json(helper.showValidationErrorResponse('USER_NOT_EXISTS'));
            }
          
            var hashedPassword = require('crypto').createHash('sha256').update(data.password).digest('hex');
            if (hashedPassword != userc.password) {
                return res.json(helper.showValidationErrorResponse('INVALID_LOGIN_CREDENTIALS'));
            }

          
        
            userc.token = jwt.sign(
                {
                    email: userc.email,
                    userId: userc._id
                },
                'secret',
                {
                    expiresIn: "9h"
                }
            );
            var mytoken = await User.updateToken(userc);
            return res.json(helper.showSuccessResponse('LOGIN_SUCCESS', mytoken));
        }
        catch (err) {
            console.log("check error ", err);
            return res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    userForgotPassword: async (req, res) => {
        try {
            var data = req.body;
            if (!data.mobileNumber && !data.email) {
                return res.json(helper.showValidationErrorResponse('MOBILE_NO_OR_EMAIL_IS_REQUIRED'))
            }
            if (data.mobileNumber) {
                if (!data.countryCode) {
                    return res.json(helper.showValidationErrorResponse('CC_IS_REQUIRED'));
                }
                var user = await User.findOne({ countryCode: data.countryCode, mobileNumber: data.mobileNumber });
                if (user) {
                    var exptime = new Date();
                    exptime.setHours(exptime.getHours() + 1);
                    var OTP = helper.generateOTP();
                    data.msg = OTP;
                  

                   //send otp from here to user 

                    data.OTP = OTP;
                    data.OTPexp = exptime;
                    data.userId = user._id;
                    User.updateOTP(data, function (err, resdata) {
                        if (err || resdata == null) {
                            console.log("err", err);
                            return res.json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                        }
                        res.json(helper.showSuccessResponse('OTP_SUCCESS', resdata));
                    });
                } else {
                    return res.json(helper.showValidationErrorResponse('MOB_NO_NOT_EXIST'));
                }
            };

            if (data.email) {
                data.email = data.email.trim().toLowerCase();
                if (!validator.isEmail(data.email)) {
                    return res.json(helper.showValidationErrorResponse('EMAIL_INVALID'));
                }

                var verifyemail = await User.find({ email: data.email });
                if (verifyemail.length == 0) {
                    return res.json(helper.showValidationErrorResponse('EMAIL_NOT_EXISTS'));
                }
                verifyemail = verifyemail[0];
                data.OTP = helper.generateOTP();
                
              //send otp on email from here to user
                var exptime = new Date();
                exptime.setHours(exptime.getHours() + 1);
                data.OTPexp = exptime;
                data.userId = verifyemail._id;
              
                User.updateOTP(data, function (err, resdata) {
                    if (err || resdata == null) {
                        return res.json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                    }
                    res.json(helper.showSuccessResponse('OTP_SUCCESS', resdata));
                })
            }
        }
        catch (err) {
            return res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    userResetPassword: async (req, res) => {
        try {
            var data = req.body;
            var userc = null;
            if (!data.password) {
                return res.json(helper.showValidationErrorResponse('PASSWORD_IS_REQUIRED'));
            }
            if (!data.confirmPassword) {
                return res.json(helper.showValidationErrorResponse('CNF_PASSWORD_IS_REQUIRED'));
            }
            if (data.password != data.confirmPassword) {
                return res.json(helper.showValidationErrorResponse('PASSWORD_CNFPASSWORD_NOT_MATCH'));
            }
            if (data.email) {
                
                if (!validator.isEmail(data.email)) {
                    return res.json(helper.showValidationErrorResponse('EMAIL_INVALID'));
                }

                userc = await User.findOne({ email: data.email });
                if (!userc) {
                    return res.json(helper.showValidationErrorResponse('EMAIL_NOT_EXIST'));
                }
            }
            if (data.mobileNumber) {
                if (!data.countryCode) {
                    return res.json(helper.showValidationErrorResponse('CC_IS_REQUIRED'));
                }
                userc = await User.findOne({ countryCode: data.countryCode, mobileNumber: data.mobileNumber });
                if (!userc) {
                    return res.json(helper.showValidationErrorResponse('MOB_NO_NOT_EXIST'));
                }
            }
            var passmain = data.password;
            if (userc) {
               

                if (userc.OTP == data.OTP) {
                    data._id = userc._id;
                    data.password = require('crypto').createHash('sha256').update(data.password).digest('hex');
                    var upass = await User.updatePassword(data);

                  

                  //send password reset message or email from here

                    res.json(helper.showSuccessResponse('PASSWORD_RESET_SUCCESS', {}));
                } else {
                    return res.json(helper.showValidationErrorResponse('OTP_NOT_MATCH'));
                }
            }
        }
        catch (err) {
            console.log("check error ", err);
            return res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },

    getUserDetail: async (req, res) => {
        try {
            var verifydata = await authroute.validateCustomer(req);
            if (verifydata == null) {
                return res.json(helper.showUnathorizedErrorResponse('NOT_AUTHORIZED'));
            }

            User.getUserByIdProfile(verifydata._id, (err, user) => {
                if (err) {
                    return res.json(helper.showDatabaseErrorResponse("INTERNAL_DB_ERROR", err));
                } else {
                    if (user == null) {
                        return res.json(helper.showValidationErrorResponse('NO_DATA_FOUND'));
                    }
                    res.json(helper.showSuccessResponse('DATA_SUCCESS', user));
                }
            });
        }
        catch (err) {
            
            res.json(helper.showInternalServerErrorResponse('INTERNAL_SERVER_ERROR'));
        }
    },
    uploadImage : async (req,res) => {
        try {
            profileImageUpload(req, res, async (err, some) => {
            var file = req.files;
            if (err) {
                req.files.forEach((element) => {
                    deleteaws(element);
                })
                return res.json(helper.showAWSImageUploadErrorResponse('IMAGE_UPLOAD_ERROR', err.message));
            }
    
    
            if(file.length == 0) {
                return res.json(helper.showValidationErrorResponse("IMAGE_IS_REQUIRED"));
            }
    
            var data = req.files[0].location;
    
            return res.json(helper.showSuccessResponse("DATA_ADDED",data));
            
            
            
            })
        }catch(err){
            console.log(err) ;
            return res.json(helper.showInternalServerErrorResponse("INTERNAL_SERVER_ERROR"));
        }
    }
}