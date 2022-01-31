var aws = require('aws-sdk');


aws.config.update({
  secretAccessKey: "SECRET_ACCESS_KEY",
  accessKeyId: "SECRET_ACCESS_ID",
  region: "REGION_NAME"
});

var s3 = new aws.S3();
var deleteFromAWS = (keyimage)=>{
    var forimage = keyimage.split("/");
    var n = forimage.length;
    keyimage = forimage[n-1];
    var params = {
      Bucket: "BUCKET_NAME", 
      Key: keyimage
    };
    s3.deleteObject(params, function(err, data) {
      if (err){ 
        console.log(err, err.stack);
      }
      else{ 
        console.log(data);  
        console.log("success");     
      } 
    });
}

module.exports = deleteFromAWS;