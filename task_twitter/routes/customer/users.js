const express = require('express');
const router = express.Router();
const usercontroller = require('../../controller/userController.js');





router.post('/register', usercontroller.userRegister);

router.post('/login', usercontroller.userPassword);

router.post('/forgotpassword', usercontroller.userForgotPassword);

router.post('/resetpassword', usercontroller.userResetPassword);

router.get('/profile', usercontroller.getUserDetail);

router.post('/updateprofile', usercontroller.userUpdateProfile);

router.post('/image',usercontroller.uploadImage);
//this api just return the url of image 








module.exports = router;