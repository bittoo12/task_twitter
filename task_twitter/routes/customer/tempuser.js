var express = require('express');
var router = express.Router();
var tucontroller = require('../../controller/tempusercontroller.js');

router.get('/', tucontroller.getTempUsersList);

router.post('/pop', tucontroller.tempUserPopulateDB);

router.delete('/remove/:mobileNumber',tucontroller.removeTempUser);

module.exports = router;