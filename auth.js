const jwt=require('jsonwebtoken');
const User=require('../model/user');

const authentication=(req,res,next)=>{
    console.log("in mid auth");
    const token=req.header('Authorization');
    const user=jwt.verify(token,process.env.TOKEN_COMPARE);
    console.log('userId======'+user.userId);
    User.findByPk(user.userId)
    .then((user)=>{
        console.log(user);
        req.user=user;
        next();
    })
    .catch((err)=>{console.log('in middleware/auth');
        console.log(err)
    res.status(401).json({success:false})});




}
module.exports={authentication};