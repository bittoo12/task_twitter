const Jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
  var token;

  if (req.headers && req.headers.token) {
    const credentials = req.headers.token;
    token = credentials;
    //console.log("token========",token);
  }
  else {
    return res.status(403).json({
      resStatus: 0,
      resMessage: 'ACCESS DENIED !! You are not authorize to access this Resource!',
    });
  }

  Jwt.verify(token,env.JWTOKEN, (err, token) => {
    //console.log("check verifyicvations ", err,"token ",  token);
    if (err) {
      return res.status(401).json({
        resStatus: 0,
        resMessage: 'The token is not valid!',
      });
    }else{
      //console.log("verificatrion ", err, token);
      if(token.role == "ADMIN" || token.role == "SUBADMIN"){
        req.token = token;
        next();
      }else{
        return res.status(401).json({
          resStatus: 0,
          resMessage: 'Not authorised to do that!',
        });
      }
    }
  });
};