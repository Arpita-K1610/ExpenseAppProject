const user=require('../model/user');
const bcrypt=require('bcrypt');
const token=require('jsonwebtoken');
exports.addUser=async(req,res,next)=>{
    try{
        
    
        const name=req.body.name;
        const email=req.body.email;
        const password=req.body.password;
         

        bcrypt.hash(password,10,async(err,hash)=>{
            console.log(err);
           try{await  user.create({
            name:name,
            email:email,
            password:hash
    
        })
        res.status(201).json({message:'Successfully created new user'});
    }
    catch(err){ console.log(res.status(404).send(err));}
        })
    
    
    
    
    
       
       
    
   

}
catch(err){console.log(err); res.send(err.data)};}


function generateAccessToken(id,pre){
    return token.sign({userId:id,ispremiumuser:pre},process.env.TOKEN_COMPARE);
}



exports.checkUser=(req,res,next)=>{
    console.log(req.body.email);
    user.findOne({where:{email:req.body.email}  })
    .then((user)=>{ 
        if(user){

            bcrypt.compare(req.body.password,user.password,(err,re)=>{
                console.log(err);
                if(!err){
                    if(re){
                        res.json({message:"User login Successful",token:generateAccessToken(user.id),premium:user.ispremiumuser});
                    }
                    else{
                        res.send({message:"Password does'nt match"});
    
                    }
                    
                }
                

            })
            

            
        }
        else{
            res.send({message:"User does'nt exist"});
        }
       
     })
    .catch((err)=>{console.log(err)});
    

}
exports.getuser= (req,res,next)=>{
    console.log('in geteeeee');
    const pre=req.user.ispremiumuser;
    console.log("in get"+pre);
    res.send(pre);
}