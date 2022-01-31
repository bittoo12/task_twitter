
const error_message = require('./errorMessages.json');
const User = require('../models/userTable');


module.exports = {

    checkRequestParams: (request_data_body, params_array, response) => {
        var missing_param = '';
        var is_missing = false;
        var invalid_param = '';
        var is_invalid_param = false;
        if (request_data_body) {
            params_array.forEach(function (param) {
                //console.log(param.name)
                if (request_data_body[param.name] == undefined) {
                    missing_param = param.name;
                    is_missing = true;
                } else {

                    if (typeof request_data_body[param.name] !== param.type) {
                        is_invalid_param = true;
                        invalid_param = param.name;
                    }
                }
            });

            if (is_missing) {
                //console.log("missing")
                response({ status: false, error_code: error_message.ERROR_CODE_PARAMETER_MISSING, message: missing_param + ' parameter missing!' });
            } else if (is_invalid_param) {
                //console.log("invaid param")
                response({ status: false, error_code: error_message.ERROR_CODE_PARAMETER_INVALID, message: invalid_param + ' parameter invalid data type!' });
            }
            else {
                response({ status: true });
            }
        }
        else {
            response({ status: true });
        }
    },

    generateOTP : () => {
        var codelength = 4;
        return Math.floor(Math.random() * (Math.pow(10, (codelength - 1)) * 9)) + Math.pow(10, (codelength - 1));
    },
    showParamsErrorResponse: (message) => {
        var resData = { "status": "failure", "status_code": 200, "error_code": 5001, "error_description": "Missing Params or Params data type error!", "message": message, "data": {}, "error": {} };
        return resData;
    },

    showValidationErrorResponse: (message) => {
        var resData = { "status": "failure", "status_code": 200, "error_code": 5002, "error_description": "Validation Error!", "message": message, "data": {}, "error": {} };
        return resData;
    },

    showInternalServerErrorResponse: (message) => {

        var resData = { "status": "failure", "status_code": 200, "error_code": 5003, "error_description": "Internal Coding error or Params Undefined!", "message": message, "data": {}, "error": {} };
        return resData;


    },

    showUnathorizedErrorResponse: (message) => {

        var resData = { "status": "failure", "status_code": 200, "error_code": 5004, "error_description": "Invalid Login Credential!", "message": message, "data": {}, "error": {} };
        return resData;


    },

    showDatabaseErrorResponse: (message, error) => {

        var resData = { "status": "failure", "status_code": 200, "error_code": 5005, "error_description": "Database error!", "message": message, "data": {}, "error": error };
        return resData;

    },

    showAWSImageUploadErrorResponse: (message, error) => {

        var resData = { "status": "failure", "status_code": 200, "error_code": 5006, "error_description": "AWS error!", "message": message, "data": {}, "error": error };
        return resData;


    },


    showSuccessResponse: (message, data) => {
        var resData = { "status": "success", "status_code": 200, "message": message, "data": data };
        return resData;
    }
  
}