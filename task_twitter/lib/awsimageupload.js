var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');


aws.config.update({
  secretAccessKey:    "SECRET_ACCESS_KEY",
  accessKeyId:    "SECRET_ACCESS_ID",
  region:    "REGION_NAME" // region of your bucket
});

var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket:    "BUCKET_NAME",
    contentLength: 500000000,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname)
    }
  })
});

module.exports = upload;