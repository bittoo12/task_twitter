var customer = require('../models/userTable.js');
var jwt = require('jsonwebtoken');


module.exports.validateCustomer = async (req) => {

    var customerid = req.get('customerid');
    var token = req.get('token');
    
    if (customerid != undefined && token != undefined) {
        try {
            var myuser = await customer.custAuth({ customerid: customerid, token: token });

           

            return myuser;

        } catch (err) {
            var myuser = null
            return myuser
        }
    } else {
        var myuser = null
        return myuser;
    }
}
