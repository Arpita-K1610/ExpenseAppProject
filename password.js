const Sib=require('sib-api-v3-sdk');
const { v4: uuidv4 } = require('uuid');
const forgot=require('../model/forgotpassword');
const user=require('../model/user');
const sequelize=require('../util/database');
const path = require('path');
const bcrypt=require('bcrypt');
const { where } = require('sequelize');
let userIdToUpdate=0;


exports.forgotPassword=(req,res,next)=>{
    
    const client=Sib.ApiClient.instance;
    const apiKey=client.authentications['api-key'];
    apiKey.apiKey=process.env.API_KEY;
    const uuid=uuidv4();
   
    console.log("emai======"+req.body.email);
    require('dotenv').config()

    
    
    

    const tranEmailApi=new Sib.TransactionalEmailsApi()
    const sender={
        email:'nishwalbh1997@gmail.com',
    }
    const receivers=[
        {
            email:req.body.email,
        },
    ]
    tranEmailApi.sendTransacEmail({
        sender,
        to:receivers,
        subject:'forgot password',
        textContent:`http://3.88.226.21/password/resetpassword/{{params.link}}`,
        params:{ 
            link:uuid
        }
        
    })
    .then(async (resp)=>{
        const t= await sequelize.transaction(); 
        try{
           
            console.log(resp);
            const userdata=await user.findOne({where:{email:req.body.email},attributes:['id'],transaction:t});
            console.log('userdata================='+userdata);
            await forgot.create({id:uuid,isactive:true,userId:userdata.dataValues.id});
            await t.commit();res.send('sucessful');
            
            
            
        }
        catch(Err){
            await t.rollback();
            console.log(Err);
        }

        
        })
    


}



exports.resetPassword= async (req,res,next)=>{
    try{
        console.log("params======="+req.body);

        const uuid=req.params.uuid;
        console.log('uuossdassssss'+uuid);
        const request=await forgot.findByPk(uuid,{attributes:['isactive','userId']});
        if(request.dataValues.isactive===true){
            userIdToUpdate=request.dataValues.userId;
            
            const filepath=path.join(__dirname,'../views','reset.html');
            res.sendFile(filepath);
        }

    }
    catch(err){
        console.log(err);

    }





}


exports.updatepassword=async(req,res,next)=>{
    const t= await sequelize.transaction();
    const password=req.body.password;
    console.log("pasword======="+password)
    try{ 
        bcrypt.hash(password,10,async(err,hash)=>{console.log(err);
            try{
                await  user.update({password:hash},{where:{id:userIdToUpdate},transaction:t})
                await forgot.update({isactive:false},{where:{userId:userIdToUpdate},transaction:t})
                await t.commit();
                res.send('<h2>Your password has been changed</h2>');
            
            }
        catch(err){
             await t.rollback();
            console.log(err);
        }})

    }
    catch(err){
        console.log(err);

    }
}